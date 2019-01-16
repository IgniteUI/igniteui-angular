Write-Host "The root folder is: " $angularDocsRoot
Write-Host "Removing " $angularDocsRoot\sass\*
Remove-Item $angularDocsRoot\sass\* -Recurse -Force
Write-Host "Removing " $angularDocsRoot\typescript\*
Remove-Item $angularDocsRoot\typescript\* -Recurse -Force
