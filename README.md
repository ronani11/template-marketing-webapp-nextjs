# base-template

This repository contains a basic repository template and should only be used if you can't find a suitable high-level template. If you want to create a new component, [visit Backstage](https://contentful.roadie.so/cd-scaffolder/new-component) instead.

## Basic structure

- `.circleci/` your circle config [learn more](https://contentful.roadie.so/catalog/default/system/circleci)
- `.github/` your github config, [learn more](https://contentful.roadie.so/catalog/default/system/github)
- `mkdocs.yml` & `docs/` your tech-docs, [learn more](https://contentful.roadie.so/catalog/default/system/documentation)
- `catalog-info.yaml` your backstage config, [learn more](https://contentful.roadie.so/catalog/default/system/backstage)

# Colorful Demo - Fintech

To deploy your own dedicated demo, check out the [following guide](https://contentful.atlassian.net/wiki/spaces/MAR/pages/2080309537/Colorful+Coin+setup+guide)

My recommendation would be to follow that guide first, which will spin up a new space for you with the populated content model and content. Then, you can use that newly created space for your local development as well.

The legal space is not spun up when the deployment script is used, instead, we re-use our existing space since it does not really need to be edited that often.

## Local development

Create an `.env` file with the folowing structure:

```
BUNDLE_ANALYZE=false
ENVIRONMENT_NAME=local

CONFIG_CONTENTFUL_META_URL=http://localhost:3000

CONFIG_CONTENTFUL_MAIN_SPACE_ID=
CONFIG_CONTENTFUL_MAIN_SPACE_TOKEN=
CONFIG_CONTENTFUL_MAIN_SPACE_PREVIEW_TOKEN=
CONFIG_CONTENTFUL_MAIN_SPACE_MANAGEMENT_TOKEN=

CONTENTFUL_DEPLOY_TOKEN=
CONTENTFUL_DEPLOY_ORG=

VERCEL_DEPLOY_TOKEN=
```

You can find the values for the legal space environment variables by checking out the `.env` file linked here [Installation guide](https://contentful.atlassian.net/wiki/spaces/MAR/pages/2080309537/Colorful+Coin+setup+guide#Installing)

Note that that .env file contains some additional variables that are only needed if you will be using the deployment script to spin up your own instance of the demo.

---

Once you have the `.env` file in place, and you have installed dependencies with `yarn`, you can run

```
yarn dev
```

to start the local development server. By default, the server will listen on `http://localhost:3000`

## Contentful Components

The term _Contentful Components_ (_ctf-compoents_ for short) is used for react components which have an equivalent contentful _content type_. E.g. all react components needed for rendering the _content-type_ **HeroBanner** can be found in the folder **src/ctf-components/ctf-hero-banner**.

Usually a _ctf-component_ is composed of 3 files:

- **ctf-[contentypeName].graphql** (holding the query strings needed for the graphql request to fetch the components data)
- **ctf-[contentypeName]-gql.tsx** (react component which executes the graphql query and passes the result to a component for rendering)
- **ctf-[contentypeName].tsx** (the react component which is actually rendering the content type)

and (optionally) a folder with typescript interfaces which were generated by graphql codegen:

- **/\_\_generated/** (see [GraphQL implementation & code generation](#GraphQL implementation & code generation))

### Component Resolver and content type mapping

There is a _component-resolver_ (_./src/components/component-resolver.tsx_) react component, which is used to pick the right react component for rendering a _content-type_. It requires as properties the _content type_ `id`, its `__typename`, `internalName` (used by xray mode), and optionally the content. The **component-resolver** then uses a key map to find the right react component (**./src/mappings.ts**), where the key is the _content type_ name and the value is the react component.

It will check the map `componentMap` first, and if the _content type_ could be resolved it is assumed all content is available (see also [Referenced content types in pages](#referenced-content-types-in-pages)). The content is then passed to the react component.

If the _content type_ could not be resolved, `componentGqlMap` will be used for resolving. If the react component is found the _content type_ `id`, `__typename`, and `internalName` will be passed, which is used by the component to fetch its data.

According to this pattern, all _ctf-components_ suffixed with **-gql** should be added to `componentGqlMap` and all without a suffix should be added to `componentMap`.

### Creating new Contentful Components

Creating new _ctf-components_ involves following steps:

- Create a folder for the compnent files (_./src/ctf-components/ctf-[contentTypeName]_)
- Create the file for the graphql query strings (_./src/ctf-components/ctf-[contentTypeName].graphql_)
- optionally, generate typescript interfaces for the graphql result by calling `yarn run graphql-generate` (see [GraphQL implementation & code generation](#GraphQL implementation & code generation)).
- create react components for rendering (**./src/ctf-components/ctf-[contentTypeName]-gql.tsx** and **./src/ctf-components/ctf-[contentTypeName].tsx**).
- Add the component to the `componentGqlMap` in _./src//mappings.ts_.

# Storybook

Colorful Coin now has a matching Storybook. You can see a hosted version [here](https://storybook.coin.colorfuldemo.com/).

Stories are defined in the `/src/stories` folder. You can follow an example there to add new components to your Storybook. General steps would be:

- Create a new folder for your story
- Create a .tsx file (or .jsx if you are not familiar with TypeScript)
- Import the component that you are tryign to document from `/src/ctf-components`
- Wrap it into the `Wrapper` component
- Pass the correct props that the component expects

# Developer Docs

## Importing / exporting space contents

Importing space contents (Models, Entries, Environments, App Integrations etc) is done as part of the `init` script. When developing, we often want to make changes to what will become our internal CF test space, for example removing an entry or renaming an environment. To make sure that the `content-backups` file stays up to date, after making changes in our contentful internal test space, we should _re-export_ the updated space contents.

This can be done using the [Contentful CLI](https://www.contentful.com/developers/docs/tutorials/cli/installation/) tool, by running the following command:

`contentful space export --space-id {{spaceId}}`

Where spaceId is the space id of the test contentful space. see here https://www.contentful.com/developers/docs/tutorials/cli/import-and-export for installation and authentication information.

See the above section, `Content model changes`, for information about generating new GraphQl introspection files when making changes to the content model.

## GraphQL implementation & code generation

This project makes use of Contentful's GraphQL API for more info see: https://www.contentful.com/developers/docs/references/graphql/. We use graphql-codegen to generate a typesafe API client, utilising React Query as the "client".

- https://www.the-guild.dev/graphql/codegen
- https://tanstack.com/query/v4

### Codegen

Making use of `graphql-codegen`, we generate typesafe React Query hooks co-located within our component folders. With an exception for schema files and shared GraphQL fragments.

To run our codegen, we have the following two scripts available. Both generate files, but the latter runs a watcher that will regenerate files on any change in .graphql files.

- `yarn run graphql-generate`
- `yarn run graphql-watch`

The first steps of the codegen generate files that contain the GraphQL schema, and matching typescript types. They're generated to the `src/lib/__generated` folder and ought to be committed once altered/added to the repository.

Additionally, the codegen watches .graphql files in our `src` folder, if it runs successfully it generates a `__generated` folder collocated in the folder where the .graphql file was found. One exception to this rule is the `src/lib/fragments` folder that contains shared GraphQL Fragments that are used in several other queries/fragments. The TS types for these files are generated in the same location, in a `__generated` folder and like the other files ought to be committed.

#### Config

The config for the codegen can be found in `codegen.ts` in the root of the project.

### React Query

API calls made to the Contentful GraphQL endpoint are made through React Query `useQuery` hooks. The hooks are generate from the `.graphql` files collocated within the components. The following happens:

1. `[folderName]/[fileName].graphql` file, containing a query, is detected by the codegen
2. `[folderName]/__generated/[fileName].generated.ts` is generated
3. Within the generated file, a new hook is generated with the following pattern: `use[fileName]`
4. The hook can now be imported and used within the `.ts(x)` files in the component folder
