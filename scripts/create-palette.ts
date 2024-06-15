import { createCanvas, Canvas } from "canvas";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { join } from "path";
import convert from "color-convert";

const OUTPUT_FOLDER: string = join(process.cwd(), "assets", "palette");

const colors: { [key: string]: { [key: string]: string } } = {
	accent: {
		base: "#6699ff",
		destructive: "#d85c5c",
	},
	text: {
		base: "#2e405c",
		muted: "#444f60",
	},
	background: {
		base: "#FAFAFA",
		mantle: "#F2F2F2",
		crust: "#E4E4E4",
	},
};

const paletteHeader: string = `## Colors

The Kōyō color scheme includes a curated selection of blue tones that evoke tranquility and natural beauty. These colors are:\n\n`;

const paletteFooter: string = `<br>Each color has been carefully chosen to harmonize with the others in the palette, providing a versatile range that can be used in various design and development projects.`;

const main = async () => {
	if (!existsSync(OUTPUT_FOLDER)) {
		mkdirSync(OUTPUT_FOLDER, { recursive: true });
	}

	console.log("Creating PNG files for each color...");
	for (const [colorType, colorTypeColors] of Object.entries(colors)) {
		for (const [colorName, colorHex] of Object.entries(colorTypeColors)) {
			const canvas: Canvas = createCanvas(45, 45);
			const ctx = canvas.getContext("2d");
			ctx.fillStyle = colorHex;
			ctx.fillRect(0, 0, 45, 45);
			const out = createWriteStream(
				join(OUTPUT_FOLDER, `${colorType}-${colorName}.png`),
			);
			const stream = canvas.createPNGStream();
			stream.pipe(out);
			out.on("finish", () =>
				console.log(`The PNG file for ${colorName} was created.`),
			);
			await new Promise((resolve) => out.on("close", resolve));
			console.log(`The PNG file for ${colorName} (${colorHex}) was created.`);
		}
	}

	console.log("Creating palette.md file...");
	const mdFile = createWriteStream(join(OUTPUT_FOLDER, "palette.md"));
	mdFile.write(paletteHeader);

	for (const [colorType, colorTypeColors] of Object.entries(colors)) {
		mdFile.write(`<details open>\n`);
		mdFile.write(`<summary>${colorType}</summary>\n`);
		mdFile.write('<table align="center">\n');
		mdFile.write("<tr>\n");
		mdFile.write("<th>Preview</th>\n");
		mdFile.write("<th>Variable</th>\n");
		mdFile.write("<th>Hex</th>\n");
		mdFile.write("<th>RGB</th>\n");
		mdFile.write("<th>HSL</th>\n");
		mdFile.write("</tr>\n");

		for (const [colorName, colorHex] of Object.entries(colorTypeColors)) {
			const colorRgb = convert.hex.rgb(colorHex);
			const colorHsl = convert.hex.hsl(colorHex);
			mdFile.write(`<tr>\n`);
			mdFile.write(
				`<td><img src="assets/palette/${colorType}-${colorName}.png" alt="${colorName}"></td>\n`,
			);
			mdFile.write(`<td><code>${colorName}</code></td>\n`);
			mdFile.write(`<td><code>${colorHex}</code></td>\n`);
			mdFile.write(`<td><code>${colorRgb}</code></td>\n`);
			mdFile.write(`<td><code>${colorHsl}</code></td>\n`);
			mdFile.write(`</tr>\n`);
			console.log(`Added ${colorName} of type ${colorType} to palette.md`);
		}
		mdFile.write("</table>");
		mdFile.write("</details>\n");

		console.log(`Added ${colorType} to palette.md`);
	}

	mdFile.write(paletteFooter);
	mdFile.end();

	console.log("All done!");
};

main();
