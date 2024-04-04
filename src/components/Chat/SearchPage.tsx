"use client";

import React from "react";
import {
  ErrorBoundary,
  Facet,
  SearchBox,
  Results,
  PagingInfo,
  ResultsPerPage,
  Paging,
} from "@elastic/react-search-ui";
import { Layout, SingleLinksFacet } from "@elastic/react-search-ui-views";
import { Typography } from "@mui/material";
import "@elastic/react-search-ui-views/lib/styles/styles.css";
import { postSearch } from "@/util/requests/postSearch";

const SearchPage = ({
  wasSearched,
  setSearchTerm,
}: {
  wasSearched: boolean;
  setSearchTerm: (searchTerm: string) => void;
}) => {

  const handleSearch = async (searchTerm: string, setSearchTerm: (searchTerm: string) => void) => {
    const searchResults = await postSearch(searchTerm);
    setSearchTerm(searchTerm);
  }
  return (
    <ErrorBoundary>
      <Layout
        header={
          <SearchBox
            debounceLength={0}
            onSubmit={(searchTerm) => {
              // TO DO: Display the results.
              handleSearch(searchTerm, setSearchTerm)
            }}
          />
        }
        sideContent={
          <div>
            <Facet field="source" label="Source" view={SingleLinksFacet} />
          </div>
        }
        bodyContent={
          <Results
            titleField="title"
            urlField="url"
            shouldTrackClickThrough={true}
            clickThroughTags={["user1"]}
          />
        }
        bodyHeader={
          <>
            {wasSearched && <PagingInfo />}
            {wasSearched && <ResultsPerPage />}
          </>
        }
        bodyFooter={<Paging />}
      />
    </ErrorBoundary>
    // <ErrorBoundary>
    //     <SearchBox
    //         debounceLength={0}
    //         onSubmit={(searchTerm) => {
    //             handleSearch(searchTerm, setSearchTerm);
    //         }}
    //     />
    //     {/* // sideContent={
    //         //     <div>
    //         //         <Facet
    //         //             field="source"
    //         //             label="Source"
    //         //             view={SingleLinksFacet}
    //         //         />
    //         //     </div>
    //         // }
    //         // bodyContent={
    //         //     <Results
    //         //         titleField="title"
    //         //         urlField="url"
    //         //         shouldTrackClickThrough={true}
    //         //         clickThroughTags={["user1"]}
    //         //     />
    //         // }
    //         // bodyHeader={
    //         //     <>
    //         //         {wasSearched && <PagingInfo />}
    //         //         {wasSearched && <ResultsPerPage />}
    //         //     </>
    //         // }
    //         // bodyFooter={<Paging />} */}
    // </ErrorBoundary>
  );
};

export default SearchPage;
