import React from 'react';
import BlogPostItem from '@theme-original/BlogPostItem';

import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import Comments from "@site/src/components/Comments";

export default function BlogPostItemWrapper(props) {
    const { metadata, isBlogPostPage } = useBlogPost();
    const { comments = true } = metadata.frontMatter;
    return (
        <div {...(isBlogPostPage ? {'data-pagefind-body': ''} : {'data-pagefind-ignore': ''})}>
            <BlogPostItem {...props} />
            {isBlogPostPage && <hr />}
            {comments && isBlogPostPage && <Comments />}
        </div>
    );
}
