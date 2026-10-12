"use client";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.bubble.css";
import { useMemo } from "react";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
export const Preview = ({ value, }) => {
    const ReactQuill = useMemo(() => dynamic(() => import("react-quill"), { ssr: false }), []);
    return (<ReactQuill value={value} theme="bubble" readOnly/>);
};
export default Preview;
