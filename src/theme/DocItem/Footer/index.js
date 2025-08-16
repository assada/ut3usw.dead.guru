import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import Comments from "@site/src/components/Comments";

export default function FooterWrapper(props) {
    const { metadata } = useDoc();
    const { comments = true } = metadata.frontMatter;
    return (
        <>
            <Footer {...props} />
            <hr />
            {comments && <Comments />}
        </>
    );
}
