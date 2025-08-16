import authorsGlobal from "js-yaml-loader!../../../docs/authors.yml";
import React from "react";
import clsx from "clsx";
import BlogAuthor from "../../theme/Blog/Components/Author";
import styles from './styles.module.css';

export default function Authors({ authors }) {
    if (!authors || authors.length === 0) {
        return <div style={{marginTop: 20, marginBottom: 20, display: "none"}}>No authors found.</div>;
    }
    
    const filteredAuthors = authors.map(authorKey => {
        const authorData = authorsGlobal[authorKey];
        if (!authorData) {
            console.warn(`Author key "${authorKey}" not found in authors.yml`);
            return null;
        }
        return {
            key: authorKey,
            ...authorData
        };
    }).filter(Boolean);

    if (filteredAuthors.length === 0) {
        return <div style={{marginTop: 20, marginBottom: 20, display: "none"}}>No valid authors found.</div>;
    }

    return (
        
        <div className={'margin-top--md margin-bottom--sm row'}>
            <div className={'col col--12 authorCol_Hf19'}>
                <div className={clsx(
                    'avatar margin-bottom--sm',
                    styles[`author-as-h2`],
                )}>
                    {filteredAuthors.map((author, i) => (
                        <BlogAuthor as={""} author={author} />
                    ))}
                </div>
            </div>
        </div>
    );
}