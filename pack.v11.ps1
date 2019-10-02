$outputDir = ".\package\"
$build = "Release"
$version = "11.0.0"

nuget.exe pack ".\src\PropertyLinkItem\PropertyLinkItem.v11.csproj" -IncludeReferencedProjects -properties Configuration=$build -Version $version -OutputDirectory $outputDir
