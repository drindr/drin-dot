#!/usr/bin/env -S deno --allow-read --allow-env

// @ts-ignore: Deno is supported but the types are a bit funky.
import MathJax from "npm:mathjax";

/**
 * Reads LaTeX from stdin, renders it as SVG using MathJax, and prints the SVG to stdout.
 *
 * Usage: deno run --allow-read --allow-env tex2svg.ts < input.tex > output.svg
 * or: echo '\frac{a}{b} = c' | deno run --allow-read --allow-env tex2svg.ts
 */
async function renderLatexToSvg() {
    // 1. Read all data from standard input
    const decoder = new TextDecoder();
    var latexInput = "";
    for await (const chunk of Deno.stdin.readable) {latexInput += decoder.decode(chunk);};
    // console.log(latexInput);

    if (!latexInput.trim()) {
        console.error("Error: No LaTeX input provided on stdin.");
        Deno.exit(1);
    }

    // 2. Configure MathJax for server-side rendering
    const mathjaxConfig = {
        tex: {
            // Allows for block display math like \frac{...}{...} without surrounding delimiters
            // If you prefer inline math, change this to `inline` or wrap input in $...$ or \(...\)
            inlineMath: {"[+]": [
                ['$', '$'],
                ['$$', '$$'],
                ['\\[', '\\]']
            ]},
            // Enable common packages
            packages: {'[+]': ['ams', 'color', 'boldsymbol', 'newcommand']},
        },
        // Use 'tex-svg' to render TeX input to SVG output
        load: ['input/tex', 'output/svg']
    };

    // 3. Typeset the LaTeX string and get the SVG output
    await MathJax.init({ loader: mathjaxConfig }).catch((err: any) => {
        console.error("MathJax Initialization Error:", err);
        Deno.exit(1);
    });
    const svg = await MathJax.tex2svgPromise(latexInput, {
    // Sets the output scale (1 is default)
    scale: 1, 
    // Ensures the math is rendered in display mode if not already wrapped
    disnplay: true 
    });
    const svgOutput = MathJax.startup.adaptor.innerHTML(svg);


    // 4. Print the generated SVG to standard output
    // await Deno.stdout.write(new TextEncoder().encode(svgOutput));
    console.log(svgOutput);
}

if (import.meta.main) {
    renderLatexToSvg();
}
