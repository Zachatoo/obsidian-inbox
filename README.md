# Obsidian Inbox

When using a third party tool to quickly write content to your Obsidian vault without opening your vault, often it's easiest to write it to an "inbox" note to process later.

This plugin will let you know if there's content to process in your inbox note when launching Obsidian.

## Installation

Use the [BRAT](https://github.com/TfTHacker/obsidian42-brat) Obsidian plugin to install this plugin. Generic installation instructions are available on that plugin's documentation.

## Commands

### Set inbox note

Sets the [inbox path](#inbox-path) and [inbox base contents](#inbox-base-contents) using the active note path and contents. This command exists to make it easier to set those settings.

## Settings

### Inbox path

Path for inbox note.

For example, if your inbox note is in the root of your vault and called "Mobile Inbox", then the path would be "Mobile Inbox".

### Compare type

What to compare the inbox note contents to when deciding whether or not to notify. 'Compare to last tracked' will compare to a snapshot from when Obsidian was last closed. 'Compare to base' will compare to a base contents that you define.

### Inbox base contents

If note content matches this exactly, then you will not be notified. This is only available if you select 'Compare to base' as the compare type.

For example, if the "unproccessed" version of your inbox note looks like this

```md
# Mobile Inbox
```

then you should set your inbox base contents to match. That way, you will only be notified if there's additional contents besides the heading.

### Inbox notice duration

Duration to show Notice when there is data to process, in seconds. Set to 0 for infinite duration. Clear to use global default Notice duration.
