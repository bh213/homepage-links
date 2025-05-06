package main

import (
	"embed" // Required for embedding files
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"gopkg.in/yaml.v3" // YAML parsing library
)

//go:embed template.html
var templateFS embed.FS // Embed the template file into the binary

// --- Configuration ---
var (
	listenAddr   = getEnv("APP_LISTEN_ADDR", ":8080")
	yamlPath     = getEnv("APP_YAML_PATH", "/data/config.yaml") // Path inside the container where YAML is mounted
	templateName = "template.html"                             // Name of the embedded template file
	cacheSeconds = getEnvInt("APP_CACHE_SECONDS", 0)           // Cache duration in seconds, 0 means no caching
)

// Cache structure to hold the configuration and its expiration time
type ConfigCache struct {
	config     *ConfigData
	expiresAt  time.Time
	mu         sync.RWMutex
}

var configCache = &ConfigCache{}

// --- YAML Data Structures ---
// These structs are designed to match the new structure with colors and groups.

// Represents a single link item within a group
type Item struct {
	Name        string `yaml:"name"`
	URL         string `yaml:"url"`         // Short path/URL (not used for linking in this template)
	Link        string `yaml:"link"`        // Actual target URL for the link
	Icon        string `yaml:"icon,omitempty"`        // Optional icon (e.g., Font Awesome class)
	Description string `yaml:"description,omitempty"` // Optional description
}

// Represents a group of items with an associated color palette
type Group struct {
	Name    string `yaml:"name"`
	Palette string `yaml:"palette"` // Name of the color palette to use (key in ConfigData.Colors)
	Items   []Item `yaml:"items"`
}

// Represents the top-level structure of the config.yaml file
type ConfigData struct {
	Title  string                       `yaml:"title"` // Page title
	Colors map[string][]string          `yaml:"colors"` // Map of palette names to lists of hex color codes
	Groups []Group                      `yaml:"groups"` // List of link groups
}

// --- Helper Functions ---

// getEnv gets an environment variable or returns a fallback value.
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

// getEnvInt gets an environment variable as an integer or returns a fallback value.
func getEnvInt(key string, fallback int) int {
	if value, ok := os.LookupEnv(key); ok {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return fallback
}

// loadConfig reads and parses the YAML file from the specified path.
// If caching is enabled, it will return the cached config if it's still valid.
func loadConfig(path string) (*ConfigData, error) {
	// Check cache if enabled
	if cacheSeconds > 0 {
		configCache.mu.RLock()
		if configCache.config != nil && time.Now().Before(configCache.expiresAt) {
			configCache.mu.RUnlock()
			return configCache.config, nil
		}
		configCache.mu.RUnlock()
	}

	log.Printf("Attempting to load YAML from: %s", path)
	absPath, err := filepath.Abs(path)
	if err != nil {
		return nil, fmt.Errorf("failed to get absolute path for '%s': %w", path, err)
	}

	yamlFile, err := os.ReadFile(absPath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, fmt.Errorf("YAML file not found at '%s': %w", absPath, err)
		}
		return nil, fmt.Errorf("failed to read YAML file '%s': %w", absPath, err)
	}

	var config ConfigData
	err = yaml.Unmarshal(yamlFile, &config)
	if err != nil {
		return nil, fmt.Errorf("failed to parse YAML file '%s': %w", absPath, err)
	}

	// Update cache if enabled
	if cacheSeconds > 0 {
		configCache.mu.Lock()
		configCache.config = &config
		configCache.expiresAt = time.Now().Add(time.Duration(cacheSeconds) * time.Second)
		configCache.mu.Unlock()
		log.Printf("Configuration cached for %d seconds", cacheSeconds)
	}

	log.Printf("Successfully loaded and parsed YAML from: %s", absPath)
	return &config, nil
}

// findItemByURL searches through all groups and items to find a matching URL
func findItemByURL(config *ConfigData, url string) *Item {
	// Ensure the URL starts with a slash for comparison
	searchURL := url
	if !strings.HasPrefix(searchURL, "/") {
		searchURL = "/" + searchURL
	}

	for _, group := range config.Groups {
		for i, item := range group.Items {
			if item.URL == searchURL {
				// Return a pointer to the actual item in the slice
				return &group.Items[i]
			}
		}
	}
	return nil
}

// --- HTTP Handler ---

// mainHandler creates the HTTP handler function.
// It needs access to the template functions for color logic.
func mainHandler(tmpl *template.Template) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		config, err := loadConfig(yamlPath)
		if err != nil {
			log.Printf("ERROR: Failed to load or parse config '%s': %v", yamlPath, err)
			if os.IsNotExist(err) {
				http.Error(w, fmt.Sprintf("Configuration file not found at %s. Please ensure the volume is mounted correctly.", yamlPath), http.StatusInternalServerError)
			} else {
				http.Error(w, "Internal Server Error: Could not load or parse configuration.", http.StatusInternalServerError)
			}
			return
		}

		// Handle root path
		if r.URL.Path == "/" {
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			err = tmpl.ExecuteTemplate(w, templateName, config)
			if err != nil {
				log.Printf("ERROR: Failed to execute template '%s': %v", templateName, err)
				return
			}
			return
		}

		// Use the full path for URL matching
		requestedURL := r.URL.Path
		log.Printf("Looking for URL: %s", requestedURL)
		
		// Debug: Print all available URLs
		for _, group := range config.Groups {
			for _, item := range group.Items {
				log.Printf("Available URL: %s -> %s (Icon: %s)", item.URL, item.Link, item.Icon)
			}
		}
		
		item := findItemByURL(config, requestedURL)
		
		if item != nil {
			log.Printf("Found matching URL, redirecting to: %s", item.Link)
			http.Redirect(w, r, item.Link, http.StatusFound)
			return
		}

		log.Printf("No matching URL found for: %s", requestedURL)
		// No matching URL found, show 404
		http.NotFound(w, r)
	}
}

// --- Main Function ---

func main() {
	log.Printf("Starting server...")
	log.Printf("Listening on: %s", listenAddr)
	log.Printf("Expecting YAML configuration at: %s", yamlPath)
	if cacheSeconds > 0 {
		log.Printf("Configuration caching enabled for %d seconds", cacheSeconds)
	} else {
		log.Printf("Configuration caching disabled")
	}

	if _, err := os.Stat(yamlPath); os.IsNotExist(err) {
		log.Printf("WARNING: YAML file '%s' not found at startup. Ensure volume is mounted. Will attempt load on first request.", yamlPath)
	} else if err != nil {
		log.Printf("WARNING: Error checking YAML file '%s' at startup: %v", yamlPath, err)
	}

	// --- Template Functions ---
	// Define custom functions to be used within the template
	// This is necessary for accessing map elements by key and doing modulo arithmetic
	funcMap := template.FuncMap{
		// getPalette retrieves a specific color palette array from the Colors map
		"getPalette": func(colors map[string][]string, paletteName string) []string {
			if palette, ok := colors[paletteName]; ok {
				return palette
			}
			log.Printf("Warning: Palette '%s' not found in config. Returning empty.", paletteName)
			return []string{} // Return empty slice if palette not found
		},
		// getColor gets a specific color from a palette using modulo arithmetic
		"getColor": func(palette []string, index int) string {
			if len(palette) == 0 {
				return "#cccccc" // Default color if palette is empty or not found
			}
			// Use modulo operator to cycle through colors
			colorIndex := index % len(palette)
			return "#" + palette[colorIndex] // Prepend '#' to the hex code
		},
		// hasPrefix checks if a string starts with a given prefix
		"hasPrefix": strings.HasPrefix,
	}

	// Parse the embedded HTML template with the custom functions
	tmpl, err := template.New(templateName).Funcs(funcMap).ParseFS(templateFS, templateName)
	if err != nil {
		log.Fatalf("FATAL: Failed to parse embedded template '%s': %v", templateName, err)
	}

	// Setup HTTP routing
	mux := http.NewServeMux()
	mux.HandleFunc("/", mainHandler(tmpl)) // Register the handler

	// Start the HTTP server
	log.Printf("Server ready to handle requests at %s", listenAddr)
	err = http.ListenAndServe(listenAddr, mux)
	if err != nil {
		log.Fatalf("FATAL: Server failed to start: %v", err)
	}
}
