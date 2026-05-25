package main

import "flag"

func main() {
	dl := flag.Bool("download-deps", false, "Download dependencies")
	personal := flag.Bool("create-personal-files", false, "Create personal files")
	bundle := flag.Bool("bundle-component-library", false, "Bundle component library")
	devMain := flag.Bool("dev-main", false, "Start developing!")
	propMap := flag.Bool("generate-html-property-mapping", false, "Generates the HTML property mapping file")
	svgSheet := flag.Bool("generate-svg-sprite-sheet", false, "Generates SVG sprite sheet")
	unpack := flag.Bool("unpack-favicon", false, "Unpacks favicon")
	removePersonal := flag.Bool("remove-personal-files", false, "Removes personal files")
	genTest := flag.Bool("generate-default-test-bench", false, "Generates the default test bench")
	testAll := flag.Bool("run-all-tests", false, "Runs all golang tests")
	genAutoImport := flag.Bool("generate-auto-import", false, "Generates auto-import file")

	flag.Parse()

	if *dl {
		DownloadDependencies()
	} else if *personal {
		CreatePersonalFiles()
	} else if *bundle {
		BundleComponentLibrary()
	} else if *devMain {
		DevMain()
	} else if *propMap {
		GenerateHtmlPropertyMapping()
	} else if *svgSheet {
		GenerateSvgSpriteSheet()
	} else if *unpack {
		UnpackFavicon()
	} else if *removePersonal {
		RemovePersonalFiles()
	} else if *genTest {
		GenerateDefaultTestBench()
	} else if *testAll {
		RunAllTests()
	} else if *genAutoImport {
		GenerateAutoImport()
	} else {
		flag.Usage()
	}
}
