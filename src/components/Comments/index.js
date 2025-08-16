import React from "react";
import Giscus from "@giscus/react";
import { useColorMode } from "@docusaurus/theme-common";

export default function Comments() {
    const { colorMode } = useColorMode();

    return (
        <div>
            <Giscus
                id="comments"
                repo="assada/ut3usw.dead.guru"
                repoId="R_kgDOKkf1bw"
                category="General"
                categoryId="DIC_kwDOKkf1b84CuIlm"
                mapping="title"
                strict="0"
                reactionsEnabled="0"
                emitMetadata="0"
                inputPosition="top"
                theme={colorMode === "dark" ? "noborder_dark" : "noborder_light"}
                lang="uk"
                loading="lazy"
            />
        </div>
    );
}