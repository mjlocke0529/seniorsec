# Accessibility pack

Applies when `project_type` is `web-app`, `static-site` or `wordpress`.

A short baseline, not a full audit. Source checks catch only a small share of accessibility problems; the rest need a browser tool and a person using a keyboard and a screen reader. Depending on who the site serves, accessibility may also be a legal requirement.

### A11Y-01  The page declares its language
**Rule.** The `<html>` element has a `lang` attribute that matches the content.
**Why.** Screen readers choose pronunciation from it, and translation tools rely on it.
**Check.** `seniorsec check` flags HTML documents and root layouts with no `lang`.
**Fix.** Set `lang` on the root element; set it on a passage when the language changes.
**Sources.** WCAG 2.2 success criterion 3.1.1 Language of Page.

### A11Y-02  Images have text alternatives
**Rule.** Every image has an `alt` attribute: a description when the image carries meaning, empty (`alt=""`) when it is decoration.
**Why.** Without it a screen reader announces the file name or nothing.
**Check.** `seniorsec check` flags `<img>` and `<Image>` tags with no `alt` attribute. It cannot judge whether the text is any good; read a sample.
**Fix.** Describe what the image tells the reader, not what it looks like. Use empty alt for decorative images.
**Sources.** WCAG 2.2 success criterion 1.1.1 Non-text Content.

### A11Y-03  Form controls have labels
**Rule.** Every input, select and textarea has a visible label tied to it, and errors are described in text.
**Why.** Placeholder text disappears on typing and is not a label. Unlabeled fields cannot be filled in by voice or screen reader users.
**Check.** Click each label: focus should move to its field. Submit an invalid form and read the error.
**Fix.** Use `<label for>` or wrap the control. Link error text with `aria-describedby`.
**Sources.** WCAG 2.2 success criteria 1.3.1 Info and Relationships, 3.3.2 Labels or Instructions.

### A11Y-04  Everything works with a keyboard
**Rule.** Every interactive element can be reached and operated with the keyboard alone, in a sensible order, with a visible focus indicator.
**Why.** Many people cannot use a pointer. Clickable `<div>`s and removed focus outlines lock them out.
**Check.** Put the mouse away. Tab through the main flows, open and close menus and dialogs.
**Fix.** Use real buttons and links, keep or restyle the focus outline, and trap focus inside open dialogs.
**Sources.** WCAG 2.2 success criteria 2.1.1 Keyboard, 2.4.7 Focus Visible.

### A11Y-05  Text is readable and the page has structure
**Rule.** Text meets contrast minimums, and headings follow a logical order with one main heading per page.
**Why.** Low contrast fails people with low vision and everyone in sunlight. Headings are how screen reader users skim.
**Check.** Run a browser accessibility scanner for contrast. List the headings; they should read as an outline.
**Fix.** Adjust colors to at least 4.5:1 for body text. Choose heading levels for structure, not size.
**Sources.** WCAG 2.2 success criteria 1.4.3 Contrast (Minimum), 1.3.1 Info and Relationships.
