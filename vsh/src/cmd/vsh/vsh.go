package main

import (
	"fmt"
	"os"

	"vsh"
)

func main() {
	if err := vsh.Run(); err != nil {
		fmt.Fprintf(os.Stderr, "vsh error: %v\n", err)
		os.Exit(1)
	}
}
