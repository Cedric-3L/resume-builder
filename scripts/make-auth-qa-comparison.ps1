Add-Type -AssemblyName System.Drawing

$workspace = (Resolve-Path ".").Path
$pairs = @(
  @{ Name = "profile"; Source = "design_exports\editorial-paper-v2\09-profile.png" },
  @{ Name = "membership"; Source = "design_exports\editorial-paper-v2\10-membership.png" },
  @{ Name = "favorites"; Source = "design_exports\editorial-paper-v2\11-favorites.png" },
  @{ Name = "orders"; Source = "design_exports\editorial-paper-v2\12-orders.png" },
  @{ Name = "tutorial"; Source = "design_exports\editorial-paper-v2\13-tutorial.png" },
  @{ Name = "admin"; Source = "design_exports\editorial-paper-v2\14-admin.png" }
)

foreach ($pair in $pairs) {
  $source = [System.Drawing.Image]::FromFile((Join-Path $workspace $pair.Source))
  $actual = [System.Drawing.Image]::FromFile((Join-Path $workspace "tmp\visual-qa\authenticated\$($pair.Name).png"))
  try {
    $canvas = New-Object System.Drawing.Bitmap(2880, 1024)
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    try {
      $graphics.Clear([System.Drawing.Color]::White)
      $graphics.DrawImage($source, 0, 0, 1440, 1024)
      $graphics.DrawImage($actual, 1440, 0, 1440, 1024)
      $canvas.Save((Join-Path $workspace "tmp\visual-qa\authenticated\$($pair.Name)-comparison.png"), [System.Drawing.Imaging.ImageFormat]::Png)
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
