Write-Host "angularDocsRoot value is: " $angularDocsRoot; #angularDocsRoot octo variable
$isLatest = $VariableIsLatest;
$tag = "VariableValue";
$path = $angularDocsRoot;
$newPath = $path -replace $tagFolder, $tag #tagFolder octo variable
$angularDocsRootFolder = [System.IO.Directory]::GetParent($angularDocsRoot);
Write-Host "newPath is:" $newPath;

#######Delete all other folders starting with <AngularMajor>.<Major>########
#######Since we are going to keep the latest and greatest########
$lastDot = $tag.LastIndexOf('.');
$filter = $tag.Substring(0,$lastDot);
$foldersToDel = Get-ChildItem -Path $angularDocsRootFolder -Directory -Filter $filter*
Write-Host "Folders to delete: " $foldersToDel

try {
foreach($f in $foldersToDel){
    if([System.IO.Directory]::Exists($f.FullName)) 
        { Write-Host $f.FullName " to be deleted!"
        Remove-Item $f.FullName -Recurse -Force } }
    }
catch { Write-Host "Exception while deleting the old folders" }

New-Item -Path $newPath -ItemType Directory -Force
Copy-Item -Path $path\* -Destination $newPath -Recurse -Force

###Add metatag inside index.html files' head section
$indexFiles = Get-ChildItem -Path $newPath -File -Recurse -Filter index.html
foreach($indexFile in $indexFiles) {
    $newText = [System.IO.File]::ReadAllText($indexFile.FullName).Replace("</head>", "    <meta name=`"robots`" content=`"noindex,nofollow`">
</head>");
    [System.IO.File]::WriteAllText($indexFile.FullName, $newText);
}

############Update the angular-docs/sass and typescript folders if isLatest flag is true###########
if($isLatest) {
    $sassFolder = $path + "\sass";
    $typeScriptFolder = $path + "\typescript";

    $sassFolderToUpdate = $path + "\..\sass";
    $typeScriptFolderToUpdate = $path + "\..\typescript";
    Write-Host "[Latest] sassFolderToUpdate is:" $sassFolderToUpdate;
    Write-Host "[Latest] typeScriptFolderToUpdate is:" $typeScriptFolderToUpdate;

    #Delete the existing content as octopus option - delete all before deployment
    try {
        Remove-Item $sassFolderToUpdate\* -Recurse -Force
        Remove-Item $typeScriptFolderToUpdate\* -Recurse -Force }
    catch { Write-Host "Exception while deleting the $sassFolderToUpdate or $typeScriptFolderToUpdate" }

    New-Item -Path $sassFolderToUpdate\latest -ItemType Directory -Force
    Copy-Item -Path $sassFolder\* -Destination $sassFolderToUpdate\latest -Recurse -Force

    New-Item -Path $typeScriptFolderToUpdate\latest -ItemType Directory -Force
    Copy-Item -Path $typeScriptFolder\* -Destination $typeScriptFolderToUpdate\latest -Recurse -Force
}

###########Json file content Update###########
$filePath = $jsonFile; #jsonFile octo variable
Write-Host "Check file exists: " ([System.IO.File]::Exists($filePath))
Write-Host "Check dir exists:" ([System.IO.Directory]::Exists($angularDocsRootFolder));

if([System.IO.File]::Exists($filePath) -and [System.IO.Directory]::Exists($angularDocsRootFolder)) {
    $folders = Get-ChildItem -Path $angularDocsRootFolder -Directory -Exclude $tagFolder,"sass","typescript" -Name | Sort-Object @{Expression = {[double]($_.Substring(0, $_.LastIndexOf('.'))) }};
    $textToUpdate = "";
    foreach($item in $folders) {
        $textToUpdate += '"' + $item + '"'; 
    }
    $textToUpdate = "[" +  $textToUpdate.Replace("`"`"","`"`,`"") + "]" ;
    Write-Host $textToUpdate;

    $content = [System.IO.File]::ReadAllText($filePath);
    $newContent = $content -replace "\[.*\]", $textToUpdate;
    [System.IO.File]::WriteAllText($filePath,$newContent);
}
