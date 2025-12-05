import fs from 'node:fs'
import { rename } from 'node:fs/promises'
import readline from 'node:readline/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join as pathJoin } from 'node:path'
import https from 'node:https'
import process from 'node:process'

process.env.TZ = 'UTC'

const rootPath = dirname(fileURLToPath(import.meta.url))
const tmpPath = pathJoin(rootPath, '.tmp.ranges.txt')
const finalPath = pathJoin(rootPath, 'ranges.txt')
const srcUrl = new URL(
    'https://raw.githubusercontent.com/tmobile/tmus-geofeed/main/tmus-geo-ip.txt',
)

const srcRes = await new Promise((promRes, promRej) => {
    https.get(srcUrl, promRes).on('error', promRej)
})

if (srcRes.statusCode !== 200) {
    throw new Error(
        `Failed to fetch source file at ${srcUrl}. Server returned status ${srcRes.statusCode}`,
    )
}

const tmpOut = fs.createWriteStream(tmpPath)
await new Promise((promRes, promRej) => {
    tmpOut
        .once('open', () => {
            const header = `# Generated from ${srcUrl.toString()}\n# Last updated: ${new Date().toISOString()}\n`
            tmpOut.write(header, err => {
                if (err) {
                    promRej(err)
                    return
                }

                promRes()
            })
        })
        .once('error', promRej)
})

const reader = readline.createInterface({
    input: srcRes,
    crlfDelay: Infinity,
    terminal: false,
})

await new Promise((promRes, promRej) => {
    let failed = false
    let lines = 0

    /** @param {any} err */
    function fail(err) {
        failed = true
        tmpOut.close()
        reader.close()
        promRej(err)
    }
    srcRes.on('error', fail)
    tmpOut.on('error', fail)
    reader.on('close', () => {
        if (failed) {
            return
        }
        if (lines === 0) {
            fail(new Error('Found no valid IP range lines from source file'))
            return
        }

        reader.close()
        tmpOut.close((err) => {
            if (err) {
                fail(err)
                return
            }
            promRes()
        })
    })

    reader.on('line', (ln) => {
        if (ln === '' || ln[0] === '#') {
            return
        }

        const commaIdx = ln.indexOf(',')
        if (commaIdx === -1) {
            return
        }

        tmpOut.write(ln.slice(0, commaIdx) + '\n')
        lines++
    })
})

await rename(tmpPath, finalPath)
