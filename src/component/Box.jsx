import { useState, useEffect } from "react";
import React from "react";

import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css"; 


export default function Box() {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  useEffect(() => {
    const savedData = localStorage.getItem("content");
    if (savedData) {
      const contentState = convertFromRaw(JSON.parse(savedData));
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, []);

  // Handle special cases for typing
  function handleBeforeInput(chars, editorState) {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();
    const blockText = contentState.getBlockForKey(blockKey).getText();

    // Detect `#` followed by space for header-one
    if (blockText === "#" && chars === " ") {
      const newContent = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 1,
        }),
        "" // Remove `#`
      );

      let updatedEditorState = EditorState.push(
        editorState,
        newContent,
        "change-block-type"
      );
    
      updatedEditorState=RichUtils.toggleBlockType(updatedEditorState, "header-one");
      setEditorState(updatedEditorState)
      return "handled";
    }

    // Handle `*` + space for bold
    if (blockText === "*" && chars === " ") {
      const newContent = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 1,
        }),
        "" // Remove `*`
      );
      const newEditorState = EditorState.push(
        editorState,
        newContent,
        "change-inline-style"
      );
      setEditorState(RichUtils.toggleInlineStyle(newEditorState, "BOLD"));
      return "handled";
    }

    // Handle `**` + space for red text
    if (blockText === "**" && chars === " ") {
      const newContent = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 2,
        }),
        "" // Remove `**`
      );
      const newEditorState = EditorState.push(
        editorState,
        newContent,
        "change-inline-style"
      );
      const redStyle = "RED_TEXT";
      setEditorState(RichUtils.toggleInlineStyle(newEditorState, redStyle));
      return "handled";
    }

    // Handle `***` + space for underline
    if (blockText === "***" && chars === " ") {
      const newContent = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 3,
        }),
        "" // Remove `***`
      );
      const newEditorState = EditorState.push(
        editorState,
        newContent,
        "change-inline-style"
      );
      setEditorState(RichUtils.toggleInlineStyle(newEditorState, "UNDERLINE"));
      return "handled";
    }

    return "not-handled";
  }

  // Handle key commands for inline styles
  function handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  }

  // Function to reset block type to "unstyled" for new lines
  function resetBlockTypeIfEmpty(editorState) {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();
    const block = contentState.getBlockForKey(blockKey);

    // If the block is empty, reset it to "unstyled"
    if (block.getText() === "" && block.getType() !== "unstyled") {
      const newEditorState = RichUtils.toggleBlockType(editorState, "unstyled");
      setEditorState(newEditorState);
    }
  }

  function handleReturn(event, editorState) {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();
    const block = currentContent.getBlockForKey(blockKey);

    // Check if the current block is empty and reset to "unstyled" when Enter is pressed
    if (block.getText() === "" && block.getType() !== "unstyled") {
      const newEditorState = RichUtils.toggleBlockType(editorState, "unstyled");
      setEditorState(newEditorState);
      return "handled";
    }

    return "not-handled";
  }

  function handleChange(newEditorState) {
    setEditorState(newEditorState);
    resetBlockTypeIfEmpty(newEditorState);
  }

  // Save content to localStorage
  function SaveContent() {
    const content = editorState.getCurrentContent();
    const Rawcontent = convertToRaw(content);
    localStorage.setItem("content", JSON.stringify(Rawcontent));
    alert("your content is saved")
  }

  const styleMap = {
    RED_TEXT: {
      color: "red",
    },
  };

  return (
    <>
      <div style={{ marginTop: '50px', marginLeft:'600px', justifyContent: 'flex-end',}}>
        <div style={{display:"flex"}}>
          <div>Demo Editor By Rahul</div>
          <div>
            <button
              onClick={SaveContent}
              style={{ boxShadow: "4px 5px 2px black",width:"120px", height:"30px", border:"3px solid black",marginLeft:'350px',cursor:"pointer"}}
              >
              Save
            </button>
          </div>
        </div>  
      </div>

      <div  style={{border:"2px solid blue",width:"1200px",height:"500px",margin:"auto", marginTop:"10px"}}>
        <Editor
          editorState={editorState}
          onChange={handleChange}
          handleKeyCommand={handleKeyCommand}
          handleBeforeInput={(chars) => handleBeforeInput(chars, editorState)}
          handleReturn={(event) => handleReturn(event, editorState)}
          customStyleMap={styleMap}
        />
      </div>
    </>
  );
}
