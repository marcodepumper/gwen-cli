# Launch GWEN in Windows Terminal (external)
# This avoids VS Code terminal limitations with ANSI escape codes

if (Get-Command wt -ErrorAction SilentlyContinue) {
    # Launch in Windows Terminal
    wt -w 0 nt --title "GWEN" pwsh -NoExit -Command "cd '$PSScriptRoot'; gwen"
} else {
    # Fallback to new PowerShell window
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; gwen"
}

Write-Host "GWEN launched in external terminal"
