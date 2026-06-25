from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter


SOURCE = Path(r"C:\Users\Liang\AppData\Local\Temp\codex-clipboard-b56dade2-1aa9-4c90-b6eb-49b83631ab55.png")
OUTPUT = Path("design_exports/editor-style-concepts")


def overlay_region(image: Image.Image, box: tuple[int, int, int, int], color: str, alpha: int) -> None:
    layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.rectangle(box, fill=(*ImageColor.getrgb(color), alpha))
    image.alpha_composite(layer)


class ImageColor:
    @staticmethod
    def getrgb(value: str) -> tuple[int, int, int]:
        value = value.lstrip("#")
        return tuple(int(value[index:index + 2], 16) for index in (0, 2, 4))


def tint_light_surfaces(image: Image.Image, color: str, strength: float) -> Image.Image:
    rgb = image.convert("RGB")
    gray = rgb.convert("L")
    mask = gray.point(lambda pixel: int(max(0, min(255, (pixel - 178) * 3.1))))
    mask = ImageEnhance.Contrast(mask).enhance(1.15)
    tint = Image.new("RGB", rgb.size, ImageColor.getrgb(color))
    mixed = Image.blend(rgb, tint, strength)
    return Image.composite(mixed, rgb, mask).convert("RGBA")


def add_preview_shadow(image: Image.Image, paper_box: tuple[int, int, int, int], color: str) -> None:
    shadow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    draw.rectangle(paper_box, fill=(*ImageColor.getrgb(color), 70))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    image.alpha_composite(shadow)


def restore_paper(image: Image.Image, source: Image.Image, paper_box: tuple[int, int, int, int]) -> None:
    paper = source.crop(paper_box).convert("RGB")
    white = Image.new("RGB", paper.size, "#FFFFFF")
    paper = Image.blend(paper, white, 0.08)
    image.paste(paper.convert("RGBA"), paper_box[:2])


def warm_editorial(source: Image.Image) -> Image.Image:
    result = tint_light_surfaces(source, "#F4F0E8", 0.34)
    width, height = result.size
    overlay_region(result, (0, 0, width, 70), "#F7F3EC", 78)
    overlay_region(result, (0, 70, 228, height), "#F7F3EC", 82)
    overlay_region(result, (228, 70, 1073, height), "#FAF8F3", 66)
    overlay_region(result, (1073, 70, width, height), "#E8E3DA", 94)
    add_preview_shadow(result, (1090, 118, width - 12, height), "#6E6254")
    restore_paper(result, source, (1090, 118, width - 12, height))
    return result


def mist_blue(source: Image.Image) -> Image.Image:
    result = tint_light_surfaces(source, "#EEF2F4", 0.3)
    width, height = result.size
    overlay_region(result, (0, 0, width, 70), "#F4F6F6", 84)
    overlay_region(result, (0, 70, 228, height), "#EDF1F1", 88)
    overlay_region(result, (228, 70, 1073, height), "#F7F9F8", 58)
    overlay_region(result, (1073, 70, width, height), "#DDE4E7", 105)
    add_preview_shadow(result, (1090, 118, width - 12, height), "#52636B")
    restore_paper(result, source, (1090, 118, width - 12, height))
    return result


def graphite_studio(source: Image.Image) -> Image.Image:
    result = tint_light_surfaces(source, "#F3F0EA", 0.21)
    width, height = result.size
    overlay_region(result, (0, 0, width, 70), "#EEEAE3", 62)
    overlay_region(result, (0, 70, 228, height), "#E8E3DB", 98)
    overlay_region(result, (228, 70, 1073, height), "#F7F4EE", 54)
    overlay_region(result, (1073, 70, width, height), "#C9C7C2", 145)
    add_preview_shadow(result, (1090, 118, width - 12, height), "#282B2E")
    restore_paper(result, source, (1090, 118, width - 12, height))
    return result


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE).convert("RGBA")
    concepts = {
        "01-warm-editorial-studio.png": warm_editorial(source),
        "02-mist-blue-workspace.png": mist_blue(source),
        "03-graphite-paper-studio.png": graphite_studio(source),
    }
    for filename, image in concepts.items():
        image.convert("RGB").save(OUTPUT / filename, quality=96, optimize=True)


if __name__ == "__main__":
    main()
