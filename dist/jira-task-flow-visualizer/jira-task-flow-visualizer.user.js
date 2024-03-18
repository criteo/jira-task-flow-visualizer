// ==UserScript==
// @name         JIRA Tasks flow visualizer
// @namespace    jira-child-issues
// @version      1
// @description  Display graph of child issue tickets of a JIRA ticket parent
// @author       Concetto Antonino Privitera
// @match        https://criteo.atlassian.net/browse/*
// @require https://raw.githubusercontent.com/criteo/jira-task-flow-visualizer/main/dist/jira-task-flow-visualizer/dependencies/d3.min.js#md5=7a6ef969ecf6b9246ad3a3a3f5b0ec35
// @require https://raw.githubusercontent.com/criteo/jira-task-flow-visualizer/main/dist/jira-task-flow-visualizer/dependencies/d3-dag.umd.min.js#md5=3291d46ee39d1f51b888df36a18368da
// @require https://raw.githubusercontent.com/criteo/jira-task-flow-visualizer/main/dist/jira-task-flow-visualizer/dependencies/showdown.min.js#md5=991afcc9ff0cbc5e70a2143ed1ecb42c
// @grant        GM_addStyle
// @updateUrl    https://raw.githubusercontent.com/criteo/jira-task-flow-visualizer/main/dist/jira-task-flow-visualizer/jira-task-flow-visualizer.user.js
// @downloadUrl  https://raw.githubusercontent.com/criteo/jira-task-flow-visualizer/main/dist/jira-task-flow-visualizer/jira-task-flow-visualizer.user.js
// @homepage     https://github.com/criteo/jira-task-flow-visualizer
// ==/UserScript==

GM_addStyle(`
.JTFV-title {
  margin: 0px;
  color: black;
}

.JTFV-warning-tooltip {
  margin: 0px;
  position: relative;
  display: inline-block;
}

.JTFV-warning-tooltip .JTFV-warning-tooltiptext {
  visibility: hidden;
  width: 300px;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;
  position: absolute;
  z-index: 900;
}

.JTFV-warning-tooltip:hover .JTFV-warning-tooltiptext {
  visibility: visible;
}

.JTFV-warning-tooltip-bottom {
    top: 135%;
    left: 50%;
    margin-left: -150px;
}

.JTFV-svg {
  cursor: grab;
  height: 100%;
  width: 100%;
  outline: none;
}

.JTFV-svg:active {
  cursor: grabbing;
}

.JTFV-top-menu {
  width: 100%;
  height: 4em;
  padding: 0.5em;
  background-color: blanchedalmond;
  display: flex;
  align-items: center; /* Vertical align the elements to the center */
}

.JTFV-button {
  display: inline-block;
  outline: 0;
  text-align: center;
  cursor: pointer;
  height: 34px;
  padding: 0 13px;
  color: #fff;
  vertical-align: top;
  border-radius: 3px;
  border: 1px solid transparent;
  transition: all .3s ease;
  background: #cc4d29;
  border-color: #cc4d29;
  font-weight: 600;
  text-transform: uppercase;
  line-height: 16px;
  font-size: 11px;
}

.JTFV-button:hover{
  background: #e4461b;
  border-color: #e4461b;
}

.JTFV-button-option {
  border: 0;
  outline: 0;
  cursor: pointer;
  color: white;
  background-color: rgb(84, 105, 212);
  box-shadow: rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 12%) 0px 1px 1px 0px, rgb(84 105 212) 0px 0px 0px 1px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(60 66 87 / 8%) 0px 2px 5px 0px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 8px;
  display: inline-block;
  min-height: 28px;
  transition: background-color .24s,box-shadow .24s;
}

.JTFV-button-option:hover{
  box-shadow: rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 12%) 0px 1px 1px 0px, rgb(84 105 212) 0px 0px 0px 1px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(60 66 87 / 8%) 0px 3px 9px 0px, rgb(60 66 87 / 8%) 0px 2px 5px 0px;
}

.JTFV-button-svg-action {
    border: 0;
    outline: 0;
    cursor: pointer;
    color: rgb(60, 66, 87);
    background-color: rgb(255, 255, 255);
    box-shadow: rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 12%) 0px 1px 1px 0px, rgb(60 66 87 / 16%) 0px 0px 0px 1px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(60 66 87 / 8%) 0px 2px 5px 0px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    padding: 4px 8px;
    display: inline-block;
    min-height: 28px;
    transition: background-color .24s,box-shadow .24s;
}
.JTFV-button-svg-action:hover {
    box-shadow: rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 12%) 0px 1px 1px 0px, rgb(60 66 87 / 16%) 0px 0px 0px 1px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(60 66 87 / 8%) 0px 3px 9px 0px, rgb(60 66 87 / 8%) 0px 2px 5px 0px;
}


.JTFV-global-container{
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

.JTFV-global-container:fullscreen{
  width: 100vw;
  height: 100vh;
  z-index: 998;
  top: 0;
  left: 0;
  background: white;
}

.JTFV-global-container-content{
  display: flex;
  width: 100%;
  height: 30em;
}

.JTFV-global-container-content-fullscreen {
  height: calc(100% - 5em);
}

.JTFV-sidebar-content{
  width: 30em;
  min-width: 20em;
  border: blanchedalmond;
  border-style: solid;
  overflow: scroll;
  height: 100%;
}

.JTFV-content{
  height: 100%;
  flex: 1 1 auto;
  border: blanchedalmond;
  border-style: solid;
  position: relative;
}

.JTFV-text-circle {
    height: 100%;
    border-radius: 100%;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.JTFV-text-circle span {
    line-height: normal;
    color: white;
    text-align: center;
}
`);

//#region MAPPERS
const mapIssueExternalToInternalModel = (issueExternalModel) => {
    return {
        key: issueExternalModel.key,
        issuelinks: issueExternalModel.fields.issuelinks.map((link) => {
            return {
                type: link.inwardIssue ? 'inwardIssue' : 'outwardIssue',
                key: link.inwardIssue
                    ? link.inwardIssue.key
                    : link.outwardIssue.key,
            };
        }),
        summary: issueExternalModel.fields.summary,
        description: issueExternalModel.fields.description, // it is in markdown
        status: issueExternalModel.fields.status.name,
        storypoints: issueExternalModel.fields.customfield_10004, // undefined for a bug, null for a story with no story points set
        url: `https://criteo.atlassian.net/browse/${issueExternalModel.key}`,
    };
};

const mapStatusInternalToIconColor = (status) => {
    switch (status) {
        case 'Closed':
        case 'Done':
            return { icon: '✔️', color: 'rgb(0, 204, 0)' };
        case 'Killed':
            return { icon: '❌', color: 'rgb(0, 204, 0)' };
        case 'Ready for Validation':
        case 'Awaiting Validation':
            return { icon: '⏳', color: 'rgb(204, 0, 204)' };
        case 'Awaiting Review':
            return { icon: '⏳', color: 'rgb(102, 0, 204)' };
        case 'In Progress':
            return { icon: '💻', color: 'rgb(204, 204, 0)' };
        case 'To Do':
        case 'Ready for Development':
            return { icon: '💤', color: 'rgb(0, 204, 204)' };
        case 'Draft':
            return { icon: '📝', color: 'rgb(204, 0, 102)' };
        case 'Blocked':
            return { icon: '⚠️', color: 'rgb(204, 0, 0)' };
        default:
            return { icon: '❔', color: 'rgb(96, 96, 96)' };
    }
};

const mapRGBArrayToString = (rgbArray) => {
    return `rgb(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]})`;
};

const mapTaskSizeToColor = (size, maxSize) => {
    const minSizeColor = [255, 0, 0];
    const maxSizeColor = [0, 255, 0];
    const undefinedSizeColor = [125, 125, 125];

    if (
        size == null ||
        maxSize == null ||
        maxSize == NaN ||
        maxSize == -Infinity
    ) {
        return mapRGBArrayToString(undefinedSizeColor);
    }
    if (maxSize == 0) {
        return mapRGBArrayToString(minSizeColor);
    }

    const finalRGBArray = colorGradientor(
        size / maxSize,
        minSizeColor,
        maxSizeColor,
    );
    return mapRGBArrayToString(finalRGBArray);
};

const colorGradientor = (p, rgb_beginning, rgb_end) => {
    var w = p * 2 - 1;

    var w1 = (w + 1) / 2.0;
    var w2 = 1 - w1;

    var rgb = [
        parseInt(rgb_beginning[0] * w1 + rgb_end[0] * w2),
        parseInt(rgb_beginning[1] * w1 + rgb_end[1] * w2),
        parseInt(rgb_beginning[2] * w1 + rgb_end[2] * w2),
    ];
    return rgb;
};
//#endregion

//#region API AND DAG DATA PREPARATION
const fetchChildIssues = async (epicKey) => {
    // Define the JIRA REST API URL to retrieve the child issues of the epic
    const apiUrl = `/rest/api/2/search?jql=parentEpic=${epicKey} AND issuetype!=Sub-task`;

    const childIssues = new Map();
    let startAt = 0;
    let total = 1;
    const maxResults = 1000;

    while (startAt < total) {
        const pageUrl = `${apiUrl}&startAt=${startAt}&maxResults=${maxResults}`;
        const response = await fetch(pageUrl);
        if (!response.ok) {
            throw new Error(
                `Failed to retrieve child issues: ${response.status} ${response.statusText}`,
            );
        }
        const data = await response.json();
        // Extract the child issues from the JIRA response and add them to the list
        data.issues.forEach((issue) => {
            const issueInternalModel = mapIssueExternalToInternalModel(issue);
            const issueKey = issueInternalModel.key;

            if (childIssues.has(issueKey) || issueKey == epicKey) {
                return;
            }

            childIssues.set(issueKey, issueInternalModel);
        });

        // Update the startAt and total variables for the next iteration
        startAt += maxResults;
        total = data.total;
    }

    //remove issue links coming from tickets outside of the current epic ticket
    for (let issue of childIssues.values()) {
        issue.issuelinks = issue.issuelinks.filter((link) =>
            childIssues.has(link.key),
        );
    }

    return childIssues;
};

const removeChildIssuesWithNoLinks = (childIssues) => {
    const childIssuesWithNoLinks = new Map();

    childIssues.forEach((childIssue) => {
        if (childIssue.issuelinks.length) {
            childIssuesWithNoLinks.set(childIssue.key, childIssue);
        }
    });

    return childIssuesWithNoLinks;
};

const setRelationshipsMap = (relationshipsMap, sourceKey, targetKey) => {
    const keySourceTargetString = `${sourceKey},${targetKey}`;
    if (!relationshipsMap.has(keySourceTargetString)) {
        relationshipsMap.set(keySourceTargetString, {
            source: sourceKey,
            target: targetKey,
        });
    }
};

const detectCrossDependency = (relationshipsMap, sourceKey, targetKey) => {
    const reversedKeySourceTargetString = `${targetKey},${sourceKey}`;
    const crossDependencyDetected = relationshipsMap.has(
        reversedKeySourceTargetString,
    );
    return crossDependencyDetected;
};

const getBlockingRelationships = (childIssues) => {
    const relationshipsMap = new Map();
    const crossDependenciesSet = new Set();
    let crossDependencyDetected = false;

    childIssues.forEach((childIssue) => {
        const inwardLinks = childIssue.issuelinks.filter(
            (link) => link.type == 'inwardIssue' && childIssues.has(link.key),
        ); // childIssues.has(link.key) needed to make sure there are no dependencies outside of my list of tasks
        const outwardLinks = childIssue.issuelinks.filter(
            (link) => link.type == 'outwardIssue' && childIssues.has(link.key),
        ); // childIssues.has(link.key) needed to make sure there are no dependencies outside of my list of tasks

        inwardLinks.forEach((link) => {
            setRelationshipsMap(relationshipsMap, childIssue.key, link.key);

            if (
                detectCrossDependency(
                    relationshipsMap,
                    childIssue.key,
                    link.key,
                ) &&
                !crossDependencyDetected
            ) {
                if (
                    !crossDependenciesSet.has(
                        `${childIssue.key}<->${link.key}`,
                    ) &&
                    !crossDependenciesSet.has(`${link.key}<->${childIssue.key}`)
                ) {
                    crossDependenciesSet.add(`${childIssue.key}<->${link.key}`);
                }
                crossDependencyDetected = true;
            }
        });
        outwardLinks.forEach((link) => {
            setRelationshipsMap(relationshipsMap, link.key, childIssue.key);

            if (
                detectCrossDependency(
                    relationshipsMap,
                    link.key,
                    childIssue.key,
                ) &&
                !crossDependencyDetected
            ) {
                if (
                    !crossDependenciesSet.has(
                        `${childIssue.key}<->${link.key}`,
                    ) &&
                    !crossDependenciesSet.has(`${link.key}<->${childIssue.key}`)
                ) {
                    crossDependenciesSet.add(`${childIssue.key}<->${link.key}`);
                }
                crossDependencyDetected = true;
            }
        });
    });

    return { relationshipsMap, crossDependencyDetected, crossDependenciesSet };
};

const createNodeParents = (childIssues, blockingRelationships) => {
    // Initialize an empty object to store the parent nodes for each node
    const parents = {};

    // Iterate over each edge
    blockingRelationships.forEach((edge) => {
        // Get the source and target nodes for the edge
        const source = edge.source;
        const target = edge.target;

        // If the target node is not already in the parent object, add it with the source node as its parent
        if (!parents[target]) {
            parents[target] = [source];
        }
        // Otherwise, append the source node to the target node's list of parents
        else {
            parents[target].push(source);
        }
    });

    // Initialize an empty array to store the arrays of node keys and parent node keys
    const nodeParentArrays = [];

    // Iterate over each node
    childIssues.forEach((node) => {
        const nodeKey = node.key;
        const parentNodes = parents[nodeKey] ?? [];

        // Add the node key and parent node keys to the nodeParentArrays array
        nodeParentArrays.push({ id: nodeKey, parentIds: parentNodes });
    });

    return nodeParentArrays;
};
//#endregion

//#region GENERATION DAG IN SVG WITH UI FEATURES AND INTERACTIONS
const setHighlightDirectLinks = (nodes, arrows, edges) => {
    const nodeLinks = new Map();

    nodes.each((d, i) => {
        const links = new Set();
        nodeLinks.set(d.data.id, links);
        d.data.parentIds.forEach((parent) => {
            if (!links.has(parent)) {
                links.add(parent);
            }
        });
        d.dataChildren.forEach((child) => {
            if (!links.has(child.child.data.id)) {
                links.add(child.child.data.id);
            }
        });
    });

    nodes
        .on('mouseenter', (event, n) => {
            arrows
                .transition()
                .attr('opacity', 0.2)
                .filter(
                    (l) =>
                        l.source.data.id === n.data.id ||
                        l.target.data.id === n.data.id,
                )
                .attr('opacity', 1);
            edges
                .transition()
                .attr('opacity', 0.2)
                .filter(
                    (l) =>
                        l.source.data.id === n.data.id ||
                        l.target.data.id === n.data.id,
                )
                .attr('opacity', 1);

            if (nodeLinks.has(n.data.id)) {
                const links = nodeLinks.get(n.data.id);

                nodes
                    .transition()
                    .attr('opacity', 0.2)
                    .filter(
                        (l) => links.has(l.data.id) || l.data.id == n.data.id,
                    )
                    .attr('opacity', 1);
            }
        })
        .on('mouseleave', (event) => {
            arrows.transition().attr('opacity', 1);
            edges.transition().attr('opacity', 1);
            nodes.transition().attr('opacity', 1);
        });
};

const setUrlOnClick = (nodesSelection, childIssues) => {
    nodesSelection.style('cursor', 'pointer').on('dblclick', (event, node) => {
        window.open(childIssues.get(node.data.id).url);
    });
};

const getCustomFormatToMarkdown = (description) => {
    // we use placeholders to avoid conflicts between different formats
    const headerPlaceholder = "HEADERPLACEHOLDER";
    const linkPlaceholderPrefix = "LINKPLACEHOLDER";
    let linkCounter = 0;
    let links = {};

    if (description == null) {
        return null;
    }

    // Headings
    description = description.replace(/^h([1-6])\.(.*)$/gm, (match, level, text) => {
        return headerPlaceholder + level + text;
    });

    // Links
    description = description.replace(/\[(.+?)(\|(.+?))?\]/g, (match, text, _, url) => {
        const placeholder = linkPlaceholderPrefix + (linkCounter++);
        links[placeholder] = url ? `[${text}](${url})` : `[${text}]`;
        return placeholder;
    });

    // Bold
    description = description.replace(/(^|\s)\*(\S.*?\S)\*(\s|$)/gm, "$1**$2**$3");

    // Italic
    description = description.replace(/(^|\s)_(\S.*?\S)_(\s|$)/gm, "$1*$2*$3");

    // Strikethrough
    description = description.replace(/(\s)-([^\s].*?[^\s])-($|\s)/g, "$1~~$2~~$3");

    // Single line block quote
    description = description.replace(/bq\. (.*)/g, "> $1");

    // Multi-line block quote
    description = description.replace(/\{quote\}(.*?)\{quote\}/gs, (match, quotedText) => {
        const lines = quotedText.split("\n").map(line => line.trim()).filter(line => line);
        const processedLines = lines.map(line => "> " + line);
        return processedLines.join("\n");
    });

    // Code Block
    description = description.replace(/\{code(:([a-z]+))?([:|]?(title|borderStyle|borderColor|borderWidth|bgColor|titleBGColor)=.+?)*\}([^]*?)\n?\{code\}/gm, "```$2$5\n```");

    // Images
    description = description.replace(/!([^|]+?)(\|[^!]+)?!/g, "![]($1)");

    // Un-Ordered Lists
    description = description.replace(/^[ \t]*(\*+)\s+/gm, match => {
        const indentation = "  ".repeat(match.trim().length - 1);
        return indentation + "- ";
    });

    // Ordered Lists
    description = description.replace(/^[ \t]*(#+)\s+/gm, match => {
        const indentation = "   ".repeat(match.trim().length - 1);
        return indentation + "1. ";
    });

    // Monospaced Text
    description = description.replace(/\{\{([^}]+)\}\}/g, "`$1`");

    // Revert placeholders to links
    for (const [placeholder, fullLink] of Object.entries(links)) {
        description = description.replace(placeholder, fullLink);
    }

    // Revert Placeholders to Headers
    description = description.replace(new RegExp(headerPlaceholder + "([1-6])(.*)", "g"), (match, level, text) => {
        return "#".repeat(parseInt(level)) + " " + text.trim();
    });

    return description;
}


const setSidebarDescriptionOnClick = (
    containerSidebarSelection,
    nodesSelection,
    childIssues,
) => {
    const converter = new showdown.Converter();

    nodesSelection.style('cursor', 'pointer').on('click', (event, node) => {
        const childIssue = childIssues.get(node.data.id);
        const key = childIssue.key;
        const title = childIssue.summary;
        const description = getCustomFormatToMarkdown(childIssue.description);
        const storyPoints = childIssue.storypoints;
        const status = childIssue.status;
        const finalMarkDown =
            '# ' +
            key +
            '\n## ' +
            title +
            '\n### status: ' +
            (status != null ? status : 'none') +
            '\n### size: ' +
            (storyPoints != null ? storyPoints : 'none') +
            '\n### ' +
            (description != null ? description : 'none');
        containerSidebarSelection.html(converter.makeHtml(finalMarkDown));
    });
};

const getColorMapTaskSize = (dag, childIssues) => {
    const maxSize = Math.max(
        ...[...childIssues.values()]
            .map((issue) => issue.storypoints)
            .filter((v) => v != null),
    );
    const colorMap = new Map();
    for (const [i, node] of dag.idescendants().entries()) {
        colorMap.set(
            node.data.id,
            mapTaskSizeToColor(
                childIssues.get(node.data.id)?.storypoints,
                maxSize,
            ),
        );
    }
    return colorMap;
};

const getColorMapTaskStatus = (dag, childIssues) => {
    const colorMap = new Map();
    for (const [i, node] of dag.idescendants().entries()) {
        colorMap.set(
            node.data.id,
            mapStatusInternalToIconColor(childIssues.get(node.data.id)?.status)
                .color,
        );
    }
    return colorMap;
};

const setColorNodesAndEdgesD3 = (
    dag,
    svgGroupSelection,
    nodesSelection,
    arrowsSelection,
    edgesSelection,
    colorMap,
) => {
    svgGroupSelection.selectAll('defs').remove();
    const defs = svgGroupSelection.append('defs'); // For gradients

    nodesSelection.attr('fill', (n) => colorMap.get(n.data.id));

    arrowsSelection.attr('fill', ({ target }) => colorMap.get(target.data.id));

    edgesSelection.attr('stroke', ({ source, target }) => {
        // encodeURIComponents for spaces, hope id doesn't have a `--` in
        const gradId = encodeURIComponent(
            `${source.data.id}--${target.data.id}`,
        );
        const grad = defs
            .append('linearGradient')
            .attr('id', gradId)
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', source.x)
            .attr('x2', target.x)
            .attr('y1', source.y)
            .attr('y2', target.y);
        grad.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', colorMap.get(source.data.id));
        grad.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', colorMap.get(target.data.id));
        return `url(#${gradId})`;
    });
};

const setColorNodesAndEdges = (
    dag,
    svgGroupSelection,
    nodesSelection,
    arrowsSelection,
    edgesSelection,
    childIssues,
    showSizeColorButtonSelection,
) => {
    const colorMap = getColorMapTaskStatus(dag, childIssues);
    setColorNodesAndEdgesD3(
        dag,
        svgGroupSelection,
        nodesSelection,
        arrowsSelection,
        edgesSelection,
        colorMap,
    );

    let isSizeColor = false;

    showSizeColorButtonSelection.on('click', () => {
        let colorMap = null;
        if (isSizeColor) {
            colorMap = getColorMapTaskStatus(dag, childIssues);
            showSizeColorButtonSelection.text('Show size color');
        } else {
            colorMap = getColorMapTaskSize(dag, childIssues);
            showSizeColorButtonSelection.text('Show progress color');
        }

        setColorNodesAndEdgesD3(
            dag,
            svgGroupSelection,
            nodesSelection,
            arrowsSelection,
            edgesSelection,
            colorMap,
        );

        isSizeColor = !isSizeColor;
    });
};

const setTextNodesD3 = (nodes, childIssues, nodeRadius, showSummary) => {
    nodes.selectAll('text').remove();
    nodes.selectAll('foreignObject').remove();
    if (!showSummary) {
        // Add text to nodes
        nodes
            .append('text')
            .text(
                (d) =>
                    `${
                        mapStatusInternalToIconColor(
                            childIssues.get(d.data.id)?.status,
                        ).icon
                    } ${d.data.id}`,
            )
            .attr('font-weight', 'bold')
            .attr('font-family', 'sans-serif')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('fill', 'white');
    } else {
        // Full text to nodes
        nodes
            .append('foreignObject')
            .attr('width', nodeRadius * 2)
            .attr('height', nodeRadius * 2)
            .attr('x', 0)
            .attr('y', 0)
            .attr(
                'transform',
                ({ x, y }) => `translate(${-nodeRadius}, ${-nodeRadius})`,
            )
            .append('xhtml:div')
            .attr('class', 'JTFV-text-circle')
            .append('xhtml:span')
            .html(
                (d) =>
                    `${
                        mapStatusInternalToIconColor(
                            childIssues.get(d.data.id)?.status,
                        ).icon
                    } ${d.data.id} <br /> ${
                        childIssues.get(d.data.id)?.summary
                    }`,
            );
    }
};

const setTextNodes = (
    nodes,
    childIssues,
    nodeRadius,
    showSummaryButtonSelection,
) => {
    let isSummaryNode = false;

    setTextNodesD3(nodes, childIssues, nodeRadius, isSummaryNode);

    showSummaryButtonSelection.on('click', () => {
        if (isSummaryNode) {
            setTextNodesD3(nodes, childIssues, nodeRadius, !isSummaryNode);
            showSummaryButtonSelection.text('Show summary in node');
        } else {
            setTextNodesD3(nodes, childIssues, nodeRadius, !isSummaryNode);
            showSummaryButtonSelection.text('Hide summary in node');
        }

        isSummaryNode = !isSummaryNode;
    });
};

const resetZoom = (svgSelection, zoom, width, height) => {
    svgSelection.transition().call(zoom.scaleTo, 1);

    svgSelection.transition().call(zoom.translateTo, 0.5 * width, 0.5 * height);
};

const setZoom = (svgSelection, svgGroupSelection, width, height) => {
    const zoom = d3
        .zoom()
        .scaleExtent([1, 100])
        .translateExtent([
            [0, 0],
            [width, height],
        ])
        .on('zoom', (e) => svgGroupSelection.attr('transform', e.transform));

    svgSelection.call(zoom);
};

const computeTranslateArrowString = (
    startPosition,
    EndPosition,
    nodeRadius,
) => {
    // This sets the arrows the node radius (20) + a little bit (3) away from the node center, on the last line segment of the edge. This means that edges that only span ine level will work perfectly, but if the edge bends, this will be a little off.
    const dx = startPosition.x - EndPosition.x;
    const dy = startPosition.y - EndPosition.y;
    const scale = (nodeRadius * 1.15) / Math.sqrt(dx * dx + dy * dy);
    // This is the angle of the last line segment
    const angle = (Math.atan2(-dy, -dx) * 180) / Math.PI + 90;
    return `translate(${EndPosition.x + dx * scale}, ${
        EndPosition.y + dy * scale
    }) rotate(${angle})`;
};

const parseTranslateNumbers = (transformString) => {
    const regex = /translate\(([\d\.]+),\s*([\d\.]+)\)/;
    const match = transformString.match(regex);
    if (match) {
        const x = parseFloat(match[1], 10);
        const y = parseFloat(match[2], 10);

        return { x, y };
    }

    return null;
};

const resetLastAction = (
    historyActions,
    nodePositions,
    nodePositionsToSaveInLocalStorage,
    areNodesWithLinksOnly,
) => {
    if (historyActions.length == 0) {
        return;
    }

    const lastAction = historyActions.pop();
    nodePositions.set(lastAction.node.id, {
        x: lastAction.node.translateNumbers.x,
        y: lastAction.node.translateNumbers.y,
    });
    lastAction.node.selection.attr(
        'transform',
        `translate(${lastAction.node.translateNumbers.x}, ${lastAction.node.translateNumbers.y})`,
    );
    lastAction.edges.forEach((edge) => edge.selection.attr('d', edge.d));
    lastAction.arrows.forEach((arrow) =>
        arrow.selection.attr('transform', arrow.transform),
    );
    if (
        lastAction.node.translateNumbers.x == lastAction.node.dagX &&
        lastAction.node.translateNumbers.y == lastAction.node.dagY
    ) {
        deleteKeyFromNodePositionsToSaveInLocalStorageAndSave(
            nodePositionsToSaveInLocalStorage,
            lastAction.node.id,
            areNodesWithLinksOnly,
        );
    } else {
        setNodePositionsToSaveInLocalStorageAndSave(
            nodePositionsToSaveInLocalStorage,
            lastAction.node.id,
            lastAction.node.translateNumbers.x,
            lastAction.node.translateNumbers.y,
            areNodesWithLinksOnly,
        );
    }
};

const getNodePositionsLocalStorageKey = (areNodesWithLinksOnly) => {
    const epicKey = getEpicKeyFromUrl();
    return `JTFV_${epicKey}_${areNodesWithLinksOnly ? 'LINKSONLY' : 'ALL'}`;
};

const saveNodePositionsInLocalStorage = (
    nodePositionsToSaveInLocalStorage,
    areNodesWithLinksOnly,
) => {
    if (!localStorage) {
        return;
    }

    try {
        const mapToSave = JSON.stringify(
            Array.from(nodePositionsToSaveInLocalStorage.entries()),
        );
        const localStorageKey = getNodePositionsLocalStorageKey(
            areNodesWithLinksOnly,
        );
        localStorage.setItem(localStorageKey, mapToSave);
    } catch (error) {
        console.log('JTFV saveNodePositionsInLocalStorage error', error);
    }
};

const setNodePositionsToSaveInLocalStorageAndSave = (
    nodePositionsToSaveInLocalStorage,
    nodeId,
    x,
    y,
    areNodesWithLinksOnly,
) => {
    nodePositionsToSaveInLocalStorage.set(nodeId, {
        x: x,
        y: y,
    });
    saveNodePositionsInLocalStorage(
        nodePositionsToSaveInLocalStorage,
        areNodesWithLinksOnly,
    );
};

const deleteKeyFromNodePositionsToSaveInLocalStorageAndSave = (
    nodePositionsToSaveInLocalStorage,
    nodeId,
    areNodesWithLinksOnly,
) => {
    nodePositionsToSaveInLocalStorage.delete(nodeId);
    saveNodePositionsInLocalStorage(
        nodePositionsToSaveInLocalStorage,
        areNodesWithLinksOnly,
    );
};

const clearNodePositionsToSaveInLocalStorageAndSave = (
    nodePositionsToSaveInLocalStorage,
    areNodesWithLinksOnly,
) => {
    nodePositionsToSaveInLocalStorage.clear();
    saveNodePositionsInLocalStorage(
        nodePositionsToSaveInLocalStorage,
        areNodesWithLinksOnly,
    );
};

const loadNodePositionsFromLocalStorage = (
    nodePositionsToSaveInLocalStorage,
    areNodesWithLinksOnly,
) => {
    if (!localStorage) {
        return;
    }

    try {
        const localStorageKey = getNodePositionsLocalStorageKey(
            areNodesWithLinksOnly,
        );
        const localStorageData = localStorage.getItem(localStorageKey);
        if (localStorageData != null) {
            const parsedData = JSON.parse(localStorageData);
            parsedData.forEach((arrayKeyValue) =>
                nodePositionsToSaveInLocalStorage.set(
                    arrayKeyValue[0],
                    arrayKeyValue[1],
                ),
            );
        }
    } catch (error) {
        console.log('JTFV loadNodePositionsFromLocalStorage error', error);
    }
};

const filterEdgesArrowsByNodeId = (edges, arrows, nodeId) => {
    const edgesCurrentNode = edges.filter(
        (l) => l.source.data.id === nodeId || l.target.data.id === nodeId,
    );

    const arrowsCurrentNode = arrows.filter(
        (l) => l.source.data.id === nodeId || l.target.data.id === nodeId,
    );

    return { edgesCurrentNode, arrowsCurrentNode };
};

const setCurrentNodeEdgesArrowsPosition = (
    currentNode,
    edgesCurrentNode,
    arrowsCurrentNode,
    nodeId,
    nodeRadius,
    nodePositions,
    newPosition,
    line,
) => {
    currentNode.attr(
        'transform',
        `translate(${newPosition.x}, ${newPosition.y})`,
    );

    edgesCurrentNode.attr('d', (l) => {
        const source =
            l.source.data.id === nodeId
                ? newPosition
                : nodePositions.get(l.source.data.id);
        const target =
            l.target.data.id === nodeId
                ? newPosition
                : nodePositions.get(l.target.data.id);
        return line([source, target]);
    });

    arrowsCurrentNode.attr('transform', ({ source, target, points }) => {
        const start =
            source.data.id === nodeId
                ? newPosition
                : nodePositions.get(source.data.id);
        const end =
            target.data.id === nodeId
                ? newPosition
                : nodePositions.get(target.data.id);

        return computeTranslateArrowString(start, end, nodeRadius);
    });
};

const initNodePositionsFromLocalStorage = (
    nodePositionsToSaveInLocalStorage,
    nodes,
    edges,
    arrows,
    nodeRadius,
    nodePositions,
    line,
    width,
    height,
) => {
    nodePositionsToSaveInLocalStorage.forEach((nodePosition, nodeId) => {
        const newPosition = {
            x: clamp(nodePosition.x, 0, width),
            y: clamp(nodePosition.y, 0, height),
        };
        const currentNode = nodes.filter((n) => n.data.id === nodeId);
        const { edgesCurrentNode, arrowsCurrentNode } =
            filterEdgesArrowsByNodeId(edges, arrows, nodeId);
        setCurrentNodeEdgesArrowsPosition(
            currentNode,
            edgesCurrentNode,
            arrowsCurrentNode,
            nodeId,
            nodeRadius,
            nodePositions,
            newPosition,
            line,
        );
        nodePositions.set(nodeId, {
            x: newPosition.x,
            y: newPosition.y,
        });
    });
};

const setDragNodes = (
    nodes,
    arrows,
    edges,
    nodeRadius,
    width,
    height,
    svgId,
    cancelLastActionButtonSelection,
    resetNodesButtonSelection,
    areNodesWithLinksOnly,
) => {
    let deltaX = 0;
    let deltaY = 0;

    let edgesCurrentNode;
    let arrowsCurrentNode;

    const historyMaxItems = 15;
    const historyActions = [];

    const nodePositionsToSaveInLocalStorage = new Map();

    const nodePositions = new Map();

    nodes.each((d, i) => {
        nodePositions.set(d.data.id, { x: d.x, y: d.y });
    });

    const line = d3
        .line()
        .curve(d3.curveCatmullRom)
        .x((d) => d.x)
        .y((d) => d.y);

    loadNodePositionsFromLocalStorage(
        nodePositionsToSaveInLocalStorage,
        areNodesWithLinksOnly,
    );
    initNodePositionsFromLocalStorage(
        nodePositionsToSaveInLocalStorage,
        nodes,
        edges,
        arrows,
        nodeRadius,
        nodePositions,
        line,
        width,
        height,
    );

    var dragHandler = d3
        .drag()
        .on('start', function (event, n) {
            const current = d3.select(this);
            const transformString = current.attr('transform');
            const translateNumbers = parseTranslateNumbers(transformString);

            if (translateNumbers) {
                deltaX = translateNumbers.x - event.x;
                deltaY = translateNumbers.y - event.y;
            }

            const filters = filterEdgesArrowsByNodeId(edges, arrows, n.data.id);
            edgesCurrentNode = filters.edgesCurrentNode;
            arrowsCurrentNode = filters.arrowsCurrentNode;

            const edgesCurrentNodeTransform = [];
            edgesCurrentNode.each(function () {
                const current = d3.select(this);
                edgesCurrentNodeTransform.push({
                    selection: current,
                    d: current.attr('d'),
                });
            });

            const arrowsCurrentNodeTransform = [];
            arrowsCurrentNode.each(function () {
                const current = d3.select(this);
                arrowsCurrentNodeTransform.push({
                    selection: current,
                    transform: current.attr('transform'),
                });
            });

            if (historyActions.length == 15) {
                historyActions.shift();
            }
            const action = {
                node: {
                    id: n.data.id,
                    dagX: n.x,
                    dagY: n.y,
                    selection: current,
                    translateNumbers: translateNumbers,
                },
                edges: edgesCurrentNodeTransform,
                arrows: arrowsCurrentNodeTransform,
            };
            historyActions.push(action);
        })
        .on('drag', function (event, n) {
            const newPosition = {
                x: clamp(event.x + deltaX, 0, width),
                y: clamp(event.y + deltaY, 0, height),
            };
            const currentNode = d3.select(this);

            setCurrentNodeEdgesArrowsPosition(
                currentNode,
                edgesCurrentNode,
                arrowsCurrentNode,
                n.data.id,
                nodeRadius,
                nodePositions,
                newPosition,
                line,
            );
        })
        .on('end', function (event, n) {
            const transformString = d3.select(this).attr('transform');
            const translateNumbers = parseTranslateNumbers(transformString);

            nodePositions.set(n.data.id, {
                x: translateNumbers.x,
                y: translateNumbers.y,
            });

            setNodePositionsToSaveInLocalStorageAndSave(
                nodePositionsToSaveInLocalStorage,
                n.data.id,
                translateNumbers.x,
                translateNumbers.y,
                areNodesWithLinksOnly,
            );
        });

    dragHandler(nodes);

    const svg = document.getElementById(svgId);
    svg.setAttribute('tabindex', '0'); //give it focus to svg so that we can listen to keydown event when we click the svg
    svg.addEventListener('keydown', (event) => {
        if (!event.ctrlKey || event.keyCode != 90) {
            return;
        }

        resetLastAction(
            historyActions,
            nodePositions,
            nodePositionsToSaveInLocalStorage,
            areNodesWithLinksOnly,
        );
    });

    cancelLastActionButtonSelection.on('click', () => {
        resetLastAction(
            historyActions,
            nodePositions,
            nodePositionsToSaveInLocalStorage,
            areNodesWithLinksOnly,
        );
    });

    resetNodesButtonSelection.on('click', () => {
        nodes.attr('transform', ({ x, y }) => `translate(${x}, ${y})`);
        edges.attr('d', ({ points }) => line(points));
        arrows.attr('transform', ({ source, target, points }) => {
            const [end, start] = points.slice().reverse();

            return computeTranslateArrowString(start, end, nodeRadius);
        });

        nodes.each((d, i) => {
            nodePositions.set(d.data.id, { x: d.x, y: d.y });
        });

        historyActions.splice(0, historyActions.length);

        clearNodePositionsToSaveInLocalStorageAndSave(
            nodePositionsToSaveInLocalStorage,
            areNodesWithLinksOnly,
        );
    });
};

const generateGraphByD3DAG = (
    svgSelection,
    svgGroupSelection,
    dataDAG,
    childIssues,
) => {
    const dag = d3.dagStratify()(dataDAG);
    const nodeRadius = 50;
    const layout = d3
        .sugiyama() // base layout
        .layering(d3.layeringLongestPath()) // alternative use d3.layeringCoffmanGraham() if you want the tasks more spread, but your root nodes won't always be at the top
        .decross(d3.decrossTwoLayer().order(d3.twolayerOpt())) // minimize number of crossings. FAST: d3.decrossTwoLayer().order(d3.twolayerGreedy().base(d3.twolayerAgg())), SLOW: d3.decrossTwoLayer().order(d3.twolayerOpt()), REALLY SLOW: d3.decrossOpt().large('large')
        .nodeSize((node) => [(node ? 3.6 : 0.25) * nodeRadius, 3 * nodeRadius]); // set node size instead of constraining to fit
    const { width, height } = layout(dag);

    // --------------------------------
    // This code only handles rendering
    // --------------------------------
    svgSelection.attr('viewBox', [0, 0, width, height].join(' '));

    // How to draw edges
    const line = d3
        .line()
        .curve(d3.curveCatmullRom)
        .x((d) => d.x)
        .y((d) => d.y);

    // Plot edges
    const edges = svgGroupSelection
        .append('g')
        .selectAll('path')
        .data(dag.links())
        .enter()
        .append('path')
        .attr('d', ({ points }) => line(points))
        .attr('fill', 'none')
        .attr('stroke-width', 3)
        .attr('opacity', 1);

    // Select nodes
    const nodes = svgGroupSelection
        .append('g')
        .selectAll('g')
        .data(dag.descendants())
        .enter()
        .append('g')
        .attr('transform', ({ x, y }) => `translate(${x}, ${y})`)
        .attr('opacity', 1);

    // Plot node circles
    nodes.append('circle').attr('r', nodeRadius);

    // How to draw arrows
    const arrowSize = (nodeRadius * nodeRadius) / 5.0;
    const arrowLen = Math.sqrt((4 * arrowSize) / Math.sqrt(3));
    const arrow = d3.symbol().type(d3.symbolTriangle).size(arrowSize);

    // Plot Arrows
    const arrows = svgGroupSelection
        .append('g')
        .selectAll('path')
        .data(dag.links())
        .enter()
        .append('path')
        .attr('d', arrow)
        .attr('transform', ({ source, target, points }) => {
            const [end, start] = points.slice().reverse();

            return computeTranslateArrowString(start, end, nodeRadius);
        })
        .attr('stroke', 'white')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', `${arrowLen},${arrowLen}`)
        .attr('opacity', 1);

    return { dag, nodes, width, height, arrows, edges, nodeRadius };
};

const addSvgGraph = (
    svgId,
    containerSvgContentSelection,
    containerSidebarSelection,
    childIssues,
    relationshipsMap,
    showSummaryButtonSelection,
    showSizeColorButtonSelection,
    cancelLastActionButtonSelection,
    resetNodesButtonSelection,
    areNodesWithLinksOnly = false,
) => {
    // Check if my svg has already been created
    if (document.getElementById(svgId)) {
        return;
    }

    // Set up an SVG group so that we can translate the final graph.
    var svgSelection = containerSvgContentSelection
        .append('svg')
        .attr('xmlns', 'http://www.w3.org/1999/xhtml')
        .attr('id', svgId)
        .attr('class', 'JTFV-svg');
    var svgGroupSelection = svgSelection.append('g');

    if (!childIssues.size) {
        return;
    }

    const dataDAG = createNodeParents(childIssues, relationshipsMap);

    try {
        const { dag, nodes, width, height, arrows, edges, nodeRadius } =
            generateGraphByD3DAG(
                svgSelection,
                svgGroupSelection,
                dataDAG,
                childIssues,
            );

        setTextNodes(
            nodes,
            childIssues,
            nodeRadius,
            showSummaryButtonSelection,
        );
        setColorNodesAndEdges(
            dag,
            svgGroupSelection,
            nodes,
            arrows,
            edges,
            childIssues,
            showSizeColorButtonSelection,
        );
        setHighlightDirectLinks(nodes, arrows, edges);
        setUrlOnClick(nodes, childIssues);
        setSidebarDescriptionOnClick(
            containerSidebarSelection,
            nodes,
            childIssues,
        );
        setZoom(svgSelection, svgGroupSelection, width, height);
        setDragNodes(
            nodes,
            arrows,
            edges,
            nodeRadius,
            width,
            height,
            svgId,
            cancelLastActionButtonSelection,
            resetNodesButtonSelection,
            areNodesWithLinksOnly,
        );
    } catch (error) {
        console.log('JTFV error', error);
    }
};
//#endregion

//#region GENERATION UI CONTAINERS AND SET UI MENU ACTIONS
const addTopMenu = (
    globalContainerSelection,
    globalContainerId,
    crossDependencyDetected,
    crossDependenciesSet,
) => {
    const containerMenuId = 'containerMenu';

    var containerMenuSelection = globalContainerSelection
        .append('div')
        .attr('id', containerMenuId)
        .attr('class', 'JTFV-top-menu');

    const titleSelection = containerMenuSelection
        .append('h3')
        .attr('class', 'JTFV-title')
        .text('JIRA Tasks Graph');

    if (crossDependencyDetected) {
        const warningSelection = containerMenuSelection
            .append('h3')
            .attr('class', 'JTFV-warning-tooltip')
            .text('⚠️');

        const warningTooltipSelection = warningSelection
            .append('span')
            .attr(
                'class',
                'JTFV-warning-tooltiptext JTFV-warning-tooltip-bottom',
            )
            .text(
                `Cross-dependency detected for the following ticket links: ${[
                    ...crossDependenciesSet,
                ].join(', ')}`,
            );
    }

    const showWithLinksOnlyButtonSelection = containerMenuSelection
        .append('button')
        .attr('class', 'JTFV-button-option')
        .style('margin-left', 'auto')
        .text('Show nodes with links only');

    const showSummaryButtonSelection = containerMenuSelection
        .append('button')
        .attr('class', 'JTFV-button-option')
        .style('margin-left', '10px')
        .text('Show summary in node');

    const showSizeColorButtonSelection = containerMenuSelection
        .append('button')
        .attr('class', 'JTFV-button-option')
        .style('margin-left', '10px')
        .text('Show size color');

    const refreshButtonSelection = containerMenuSelection
        .append('button')
        .attr('class', 'JTFV-button')
        .style('margin-left', '50px')
        .text('Full screen 🔍');

    return {
        showWithLinksOnlyButtonSelection,
        showSummaryButtonSelection,
        showSizeColorButtonSelection,
        refreshButtonSelection,
    };
};

const generateGlobalContainer = (descriptionField, globalContainerId) => {
    var descriptionFieldSelection = d3.select(descriptionField);
    var globalContainerSelection = descriptionFieldSelection
        .append('div')
        .attr('id', globalContainerId)
        .attr('class', 'JTFV-global-container');

    return { globalContainerSelection };
};

const generateGlobalContainerContent = (globalContainerSelection) => {
    const containerContentId = 'containerContent';

    var containerContentSelection = globalContainerSelection
        .append('div')
        .attr('id', containerContentId)
        .attr('class', 'JTFV-global-container-content');

    return { containerContentSelection };
};

const generateSidebar = (containerContentSelection) => {
    const containerSidebarId = 'containerSidebar';

    var containerSidebarSelection = containerContentSelection
        .append('div')
        .attr('id', containerSidebarId)
        .attr('class', 'JTFV-sidebar-content')
        .text('Click a task to show description');

    return { containerSidebarSelection };
};

const generateSvgContentContainerAndSvgButtons = (
    containerContentSelection,
) => {
    const containerSvgContentId = 'containerSvgContent';

    var containerSvgContentSelection = containerContentSelection
        .append('div')
        .attr('id', containerSvgContentId)
        .attr('class', 'JTFV-content');

    var svgMenuSelection = containerSvgContentSelection
        .append('div')
        .style('position', 'absolute')
        .style('right', '30px')
        .style('bottom', '30px');

    const cancelLastActionButtonSelection = svgMenuSelection
        .append('button')
        .attr('class', 'JTFV-button-svg-action')
        .style('margin-left', '10px')
        .text('Cancel last action');

    const resetNodesButtonSelection = svgMenuSelection
        .append('button')
        .attr('class', 'JTFV-button-svg-action')
        .style('margin-left', '10px')
        .text('Reset node positions');

    return {
        containerSvgContentSelection,
        cancelLastActionButtonSelection,
        resetNodesButtonSelection,
    };
};

const setFullscreenAction = (
    globalContainerId,
    refreshButtonSelection,
    containerContentSelection,
) => {
    let isShowing = false;
    refreshButtonSelection.on('click', () => {
        var globalContainer = document.getElementById(globalContainerId);
        if (isShowing) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
        } else {
            globalContainer.requestFullscreen({ navigationUI: 'show' });
            containerContentSelection.classed(
                'JTFV-global-container-content-fullscreen',
                true,
            );
            refreshButtonSelection.text('Minimize 🔍');
        }

        isShowing = !isShowing;
    });

    document.addEventListener('fullscreenchange', (event) => {
        if (document.fullscreenElement === null) {
            // The document has exited fullscreen mode
            containerContentSelection.classed(
                'JTFV-global-container-content-fullscreen',
                false,
            );
            isShowing = false;
            refreshButtonSelection.text('Full screen 🔍');
        }
    });
};

const showNodesWithLinksOrNot = (
    svgId,
    childIssues,
    childIssuesWithLinksOnly,
    containerSvgContentSelection,
    containerSidebarSelection,
    relationshipsMap,
    showSummaryButtonSelection,
    showSizeColorButtonSelection,
    showWithLinksOnlyButtonSelection,
    cancelLastActionButtonSelection,
    resetNodesButtonSelection,
) => {
    let areNodesWithLinksOnly = false;

    showWithLinksOnlyButtonSelection.on('click', () => {
        const svg = document.getElementById(svgId);
        if (!svg) {
            return;
        }
        svg.remove();

        if (areNodesWithLinksOnly) {
            addSvgGraph(
                svgId,
                containerSvgContentSelection,
                containerSidebarSelection,
                childIssues,
                relationshipsMap,
                showSummaryButtonSelection,
                showSizeColorButtonSelection,
                cancelLastActionButtonSelection,
                resetNodesButtonSelection,
                !areNodesWithLinksOnly,
            );
            showWithLinksOnlyButtonSelection.text('Show nodes with links only');
        } else {
            addSvgGraph(
                svgId,
                containerSvgContentSelection,
                containerSidebarSelection,
                childIssuesWithLinksOnly,
                relationshipsMap,
                showSummaryButtonSelection,
                showSizeColorButtonSelection,
                cancelLastActionButtonSelection,
                resetNodesButtonSelection,
                !areNodesWithLinksOnly,
            );
            showWithLinksOnlyButtonSelection.text('Show all nodes');
        }

        showSummaryButtonSelection.text('Show summary in node');
        showSizeColorButtonSelection.text('Show size color');
        areNodesWithLinksOnly = !areNodesWithLinksOnly;
    });
};

const generateAll = (
    svgContainer,
    globalContainerId,
    childIssues,
    relationshipsMap,
    crossDependencyDetected,
    crossDependenciesSet,
    childIssuesWithLinksOnly,
) => {
    if (!childIssues.size) {
        return;
    }

    const descriptionField = svgContainer;
    const globalContainer = document.getElementById(globalContainerId);
    if (!descriptionField || globalContainer) {
        return;
    }
    descriptionField.style.flexWrap = 'wrap';

    const { globalContainerSelection } = generateGlobalContainer(
        descriptionField,
        globalContainerId,
    );

    const {
        showWithLinksOnlyButtonSelection,
        showSummaryButtonSelection,
        showSizeColorButtonSelection,
        refreshButtonSelection,
    } = addTopMenu(
        globalContainerSelection,
        globalContainerId,
        crossDependencyDetected,
        crossDependenciesSet,
    );

    const { containerContentSelection } = generateGlobalContainerContent(
        globalContainerSelection,
    );
    const { containerSidebarSelection } = generateSidebar(
        containerContentSelection,
    );

    const {
        containerSvgContentSelection,
        cancelLastActionButtonSelection,
        resetNodesButtonSelection,
    } = generateSvgContentContainerAndSvgButtons(containerContentSelection);

    const svgId = 'svgGraph';
    addSvgGraph(
        svgId,
        containerSvgContentSelection,
        containerSidebarSelection,
        childIssues,
        relationshipsMap,
        showSummaryButtonSelection,
        showSizeColorButtonSelection,
        cancelLastActionButtonSelection,
        resetNodesButtonSelection,
    );

    showNodesWithLinksOrNot(
        svgId,
        childIssues,
        childIssuesWithLinksOnly,
        containerSvgContentSelection,
        containerSidebarSelection,
        relationshipsMap,
        showSummaryButtonSelection,
        showSizeColorButtonSelection,
        showWithLinksOnlyButtonSelection,
        cancelLastActionButtonSelection,
        resetNodesButtonSelection,
    );

    setFullscreenAction(
        globalContainerId,
        refreshButtonSelection,
        containerContentSelection,
    );
};
//#endregion

//#region GETTERS
const getSvgContainer = () => {
    return document.querySelector(
        '[data-testid="issue.views.field.rich-text.description"]',
    );
};

const getEpicKeyFromUrl = () => {
    return window.location.pathname.split('/').pop();
};
//#endregion

//#region UTILITIES
const clamp = (num, min, max) => {
    return num <= min ? min : num >= max ? max : num;
};
//#endregion

const main = async () => {
    'use strict';
    console.log('JTFV is starting');

    // Retrieve the JIRA epic ticket key from the URL
    const epicKey = getEpicKeyFromUrl();
    const globalContainerId = 'globalContainer';

    // Call the fetchChildIssues function and print the list
    const allChildIssues = await fetchChildIssues(epicKey);
    const childIssuesWithLinksOnly =
        removeChildIssuesWithNoLinks(allChildIssues);
    const childIssues = allChildIssues;
    console.log(
        `JTFV has fetched the following child issues of ${epicKey}:`,
        allChildIssues,
    );
    console.log(
        `JTFV has the following child issues with links only of ${epicKey}:`,
        childIssuesWithLinksOnly,
    );
    const { relationshipsMap, crossDependencyDetected, crossDependenciesSet } =
        getBlockingRelationships(childIssues);

    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList') {
                const svgContainer = getSvgContainer();
                const generatedElement =
                    document.getElementById(globalContainerId);
                if (
                    epicKey == getEpicKeyFromUrl() &&
                    svgContainer &&
                    !generatedElement
                ) {
                    generateAll(
                        svgContainer,
                        globalContainerId,
                        childIssues,
                        relationshipsMap,
                        crossDependencyDetected,
                        crossDependenciesSet,
                        childIssuesWithLinksOnly,
                    );
                }
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
};
main();
