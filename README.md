# tmobile-ip-ranges

Formatted IP ranges sourced from T-Mobile's tmus-geofeed repo.

All ranges can be found in the [ranges.txt](ranges.txt) file.
Each range is CIDR-formatted, e.g. `192.168.1.0/24`.

# Updating

Run `node update.ts` with Node.js v25.2.0 or higher. It will download and format the IP ranges.

You do not need to run `npm install`; the script has no non-Node dependencies.
