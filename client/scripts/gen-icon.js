// Generate a 256x256 PNG icon for QuizForge
// Purple rounded square with white "Q"
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Create a minimal PNG file with a purple background and white Q
// We'll use a raw canvas approach via a simple BMP-to-PNG pipeline
// Actually, electron-builder can accept ICO or PNG. Let's create a valid SVG
// and since we can't easily convert without sharp, let's check if sharp is available

async function main() {
  try {
    // Try sharp first
    const sharp = (await import('sharp')).default
    const size = 256
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" rx="48" ry="48" fill="#7c3aed"/>
        <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
              font-family="Arial, sans-serif" font-size="160" font-weight="bold" fill="white">Q</text>
      </svg>
    `
    const outputPath = join(__dirname, '..', 'public', 'icon.png')
    await sharp(Buffer.from(svg)).resize(256, 256).png().toFile(outputPath)
    console.log('Icon created at', outputPath)
  } catch {
    // Fallback: save SVG directly and create a minimal valid PNG
    console.log('sharp not available, creating SVG icon')
    const svg = `<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" rx="48" ry="48" fill="#7c3aed"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial, sans-serif" font-size="160" font-weight="bold" fill="white">Q</text>
</svg>`
    const svgPath = join(__dirname, '..', 'public', 'icon.svg')
    writeFileSync(svgPath, svg)
    console.log('SVG icon created at', svgPath)
    console.log('Note: For best results install sharp and re-run, or manually convert to PNG')
  }
}

main()
