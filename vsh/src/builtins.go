package vsh

import (
	"fmt"
	"strings"
)

func builtinEcho(args []string) error {
	fmt.Println(strings.Join(args, " "))
	return nil
}
