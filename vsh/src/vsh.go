package vsh

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"strings"

	"github.com/chzyer/readline"
	"mvdan.cc/sh/v3/syntax"
)

// Run starts the shell's main loop.
func Run() error {
	rl, err := readline.New("vsh> ")
	if err != nil {
		return err
	}
	defer rl.Close()

	parser := syntax.NewParser()

	for {
		line, err := rl.Readline()
		if err != nil {
			if err == io.EOF {
				return nil
			}
			return err
		}

		if strings.TrimSpace(line) == "" {
			continue
		}

		f, err := parser.Parse(strings.NewReader(line), "")
		if err != nil {
			fmt.Fprintf(os.Stderr, "vsh parse error: %v\n", err)
			continue
		}

		for _, stmt := range f.Stmts {
			if call, ok := stmt.Cmd.(*syntax.CallExpr); ok {
				// Handle variable assignments (e.g., FOO=bar)
				for _, assign := range call.Assigns {
					name := assign.Name.Value
					value := evalWord(assign.Value)
					SetVar(name, value)
				}

				if len(call.Args) == 0 {
					continue
				}

				var args []string
				for _, word := range call.Args {
					args = append(args, evalWord(word))
				}

				if len(args) == 0 {
					continue
				}

				cmdName := args[0]
				cmdArgs := args[1:]

				if cmdName == "exit" {
					return nil
				}

				if err := execute(cmdName, cmdArgs); err != nil {
					fmt.Fprintf(os.Stderr, "vsh: %v\n", err)
				}
			} else {
				fmt.Fprintf(os.Stderr, "vsh: unhandled command type in parser\n")
			}
		}
	}
}

// evalWord performs basic quote removal and variable expansion.
func evalWord(word *syntax.Word) string {
	if word == nil {
		return ""
	}

	var sb strings.Builder
	for _, part := range word.Parts {
		sb.WriteString(evalWordPart(part))
	}
	return sb.String()
}

func evalWordPart(part syntax.WordPart) string {
	var sb strings.Builder
	switch p := part.(type) {
	case *syntax.Lit:
		sb.WriteString(p.Value)
	case *syntax.SglQuoted:
		sb.WriteString(p.Value)
	case *syntax.DblQuoted:
		for _, dp := range p.Parts {
			sb.WriteString(evalWordPart(dp))
		}
	case *syntax.ParamExp:
		if p.Param != nil {
			sb.WriteString(GetVar(p.Param.Value))
		}
	}
	return sb.String()
}

func execute(name string, args []string) error {
	// Builtins
	switch name {
	case "echo":
		return builtinEcho(args)
	}

	// External commands
	cmd := exec.Command(name, args...)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		if _, ok := err.(*exec.ExitError); ok {
			// Command failed with a non-zero exit code
			return nil
		}
		return fmt.Errorf("failed to execute %s: %v", name, err)
	}
	return nil
}
