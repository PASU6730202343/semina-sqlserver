# สร้าง database agrimatch + ตาราง + ข้อมูลตั้งต้น + view/function/procedure/trigger
# ใช้: .\setup.ps1                       (Windows Authentication, server = localhost)
#      .\setup.ps1 -Server "." -User sa -Password "xxxx"
param(
    [string]$Server = "localhost",
    [string]$User,
    [string]$Password
)
$ErrorActionPreference = "Stop"
$auth = if ($User) { [string[]]@("-U", $User, "-P", $Password) } else { [string[]]@("-E") }
Get-ChildItem -Path $PSScriptRoot -Filter "0*.sql" | Sort-Object Name | ForEach-Object {
    Write-Host "Running $($_.Name) ..."
    $sqlArgs = @("-S", $Server) + $auth + @("-C", "-b", "-f", "65001", "-i", $_.FullName)
    & sqlcmd $sqlArgs
    if ($LASTEXITCODE -ne 0) { throw "$($_.Name) failed" }
}
Write-Host "Done."
