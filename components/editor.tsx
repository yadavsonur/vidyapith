"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import {useMemo } from "react";


const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface EditorProps {
  onChange: (value: string) => void;
  value: string;
}

export const Editor = ({ 
    onChange,
    value,
 }: EditorProps) => {
  
  const ReactQuill =useMemo(()=>dynamic(()=>import("react-quill"), {ssr:false}),[])
  
  return (
    <div className="bg-white">
    <ReactQuill
      value={value}
      onChange={onChange}
      theme="snow"
    />
    </div>
  );
};

export default Editor;
