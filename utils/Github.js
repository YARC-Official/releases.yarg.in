import { graphql } from "@octokit/graphql";

/**
 * @param {string} query
 * @param {Object} variables
 */
export async function GithubGraphQL(query, variables) {
    const data = await graphql(query, {
        ...variables,
        headers: {
            authorization: `token ${process.env.GITHUB_TOKEN}`
        }
    });

    return data;
}

/**
 * @param {string} repositoryAuthor
 * @param {string} repositoryName
 * @param {number} [quantity] - How many releases will be returned.
 */
export async function GetSortedReleases(repositoryAuthor, repositoryName, quantity = 100) {
    const data = await GithubGraphQL(`
        query($owner: String!, $repo: String!, $quantity: Int!) {
            repository(owner: $owner, name: $repo) {
                    releases(first: $quantity, orderBy: {field: CREATED_AT, direction: DESC}) {
                nodes {
                    tagName,
                    publishedAt
                }
                }
            }
        }
    `, {
        owner: repositoryAuthor,
        repo: repositoryName,
        quantity
    });

    return data;
}

/**
 *
 * @param {string} repositoryAuthor
 * @param {string} repositoryName
 * @param {string} branch
 * @param {string} since
 * @param {string} [until]
 * @returns
 */
export async function GetCommits(repositoryAuthor, repositoryName, branch, since, until) {
    const data = await GithubGraphQL(`
        query GetCommits($owner: String!, $repo: String!, $branch: String!, $since: GitTimestamp!, $until: GitTimestamp) {
            repository(owner: $owner, name: $repo) {
                ref(qualifiedName:$branch) {
                target {
                ... on Commit {
                    history(first: 100, since:$since, until:$until) {
                    nodes {
                        oid,
                        author {
                            name,
                            user {
                                login
                            }
                        },
                        messageHeadline
                        message
                    }
                    }
                }
                }
            }
            }
        }
    `, {
        owner: repositoryAuthor,
        repo: repositoryName,
        branch,
        since,
        until
    });

    return data.repository.ref.target.history.nodes;
}
