# ------------- Build Stage -------------
# Use an official Go image. Choose an alpine variant for smaller size.
FROM golang:1.24-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Install build tools and ca-certificates
# ca-certificates are needed here so we can copy them later if the app needs them
RUN apk add --no-cache git build-base ca-certificates

# Copy go module files first to leverage Docker cache
COPY go.mod go.sum ./
# Download dependencies
RUN go mod download

# Copy the rest of the application source code
COPY . .

# Build the Go application statically linked.
# -ldflags="-w -s" strips debug information and symbols, making the binary smaller.
# CGO_ENABLED=0 disables CGO, ensuring a static binary without C library dependencies,
# which is essential for running on 'scratch'.
RUN CGO_ENABLED=0 go build -ldflags="-w -s" -o /app/homepage-links .

# ------------- Runtime Stage -------------
# Use the special 'scratch' image, which is completely empty.
FROM scratch

# Set the working directory. This directory structure will be created implicitly
# when we copy the binary into it.
WORKDIR /app

# --- Optional: Copy CA certificates ---
# Uncomment the following line ONLY IF your application needs to make
# outgoing HTTPS requests. Our current example does not.
# COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt

# --- Optional: Copy Timezone info ---
# Uncomment if your app needs timezone data (e.g., for logging with local times)
# COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Copy only the compiled application binary from the build stage.
# Ensure the destination path is absolute.
COPY --from=builder /app/homepage-links /app/homepage-links

# Declare the volume where the YAML file will be mounted.
# This adds metadata; the actual mounting happens during 'docker run'.
VOLUME /data

# Expose the port the application will listen on.
# This is metadata for documentation and networking tools.
EXPOSE 80

# Define the command to run the application.
# Must be an absolute path since 'scratch' has no $PATH.
CMD ["/app/homepage-links"]