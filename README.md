# tmobile-ip-ranges

Formatted IP ranges sourced from T-Mobile's tmus-geofeed repo.

All ranges can be found in the [ranges.txt](ranges.txt) file.
Each range is CIDR-formatted, e.g. `192.168.1.0/24`.

# Updating

Run `npm install --omit=dev`, then `node update.js`.

It will download and format the IP ranges.
