[![Docker Automated build](https://img.shields.io/docker/automated/bh213/homepage-links.svg)](https://hub.docker.com/r/bh213/homepage-links/) [![Docker Build Status](https://img.shields.io/docker/build/bh213/homepage-links.svg)](https://hub.docker.com/r/bh213/homepage-links/builds/)
# homepage-links


Simple application for showing webpage with configurable links. Useful for homelab or running as part of docker-compose where there are too many web servers/ports running at the same time.



## Screenshot 

![Screenshot](docs/screenshot.png?raw=true "Screenshot")


## Sample configuration

Configuration is stored in `config/config.yml`

```
title: Sample page
colors:
  pack:
     - 'DD1E2F'
     - 'EBB035'
     - '06A2CB'
     - '218559'
     - 'D0C6B1'
     - '192823'
  pink:
     - 'C5AAF5'
     - 'A3CBF1'
     - '79BFA1'
     - 'F5A352'
     - 'FB7374'
     - '423C40'

groups:
  - name: Links
    palette: pack
    items:
      - name: Weather
        url: /weather
        link: http://weather.com
        description: My local weather
        icon: fa-cloud

      - name: Rainfall radar
        url: /rainfall
        link: http://rainfall-radar.com
        description: Shows rainfall in my area
        icon: fa-umbrella

      - name: My school
        url: /school
        link: http://www.school.com
        description: My school
        icon: fa-pencil

      - name: Maths
        url: /maths
        link: http://learn-math.com
        description: Learn maths
        icon: fa-area-chart
		
      - name: MAX
        url: /max
        link: http://192.168.0.77:7777
        description: Thermostat
        icon: fa-thermometer-half

      - name: Guess the note
        url: /note
        link: http://www.teachingfiles.co.uk/namethatnote2.htm
        description: Guess the note
        icon: fa-music

  - name: Homelab
    palette: pink
    items:
      - name: PFsense
        url: /pfsense
        link: http://192.168.0.1
        description: Router & firewal
        icon: fa-ban

      - name: Unifi
        url: /unifi
        link: http://192.168.0.12:8080
        description: Unifi wireless manager
        icon: fa-wifi

      - name: Diskstation
        url: /diskstation
        link: http://192.168.0.50
        description: Synology NAS
        icon: fa-server


```



## Notes

`link` is where user will be redirected to. 


Optional `url` gives users ability to use shorter, more meaningful urls. For example, if homepage links is running on http://home.lan, using above config you can use http://home.lan/unify and you'll be automatically redirected to http://192.168.0.12:8080


`icon` is  [Font Awesome](http://fontawesome.io/icons/)  name. E.g. `fa-bath` will show [this](http://fontawesome.io/icon/bath/) icon
