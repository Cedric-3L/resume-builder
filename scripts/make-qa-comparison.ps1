Add-Type -AssemblyName System.Drawing

$workspace = (Resolve-Path ".").Path
$pairs = @(
  @{
    Name = "homepage-comparison.png"
    Source = Join-Path $workspace "design_exports\editorial-paper-v2\01-homepage.png"
    Actual = Join-Path $workspace "tmp\visual-qa\homepage.png"
  },
  @{
    Name = "templates-comparison.png"
    Source = Join-Path $workspace "design_exports\editorial-paper-v2\02-templates-v2-long.png"
    Actual = Join-Path $workspace "tmp\visual-qa\templates.png"
  },
  @{
    Name = "login-comparison.png"
    Source = Join-Path $workspace "design_exports\editorial-paper-v2\05-login-v2.png"
    Actual = Join-Path $workspace "tmp\visual-qa\login.png"
  }
)

foreach ($pair in $pairs) {
  $source = [System.Drawing.Image]::FromFile($pair.Source)
  $actual = [System.Drawing.Image]::FromFile($pair.Actual)
  try {
    $height = 1024
    $width = 2880
    $canvas = New-Object System.Drawing.Bitmap($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    try {
      $graphics.Clear([System.Drawing.Color]::White)
      $graphics.DrawImage($source, 0, 0, 1440, 1024)
      $graphics.DrawImage($actual, 1440, 0, 1440, 1024)
      $output = Join-Path $workspace ("tmp\visual-qa\" + $pair.Name)
      $canvas.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
      $graphics.Dispose()
      $canvas.Dispose()
    }
  }
  finally {
    $source.Dispose()
    $actual.Dispose()
  }
}
