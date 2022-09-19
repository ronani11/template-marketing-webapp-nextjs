import { Personalize } from '@ninetailed/experience.js-next';
import React from 'react';
import { useQuery } from 'react-apollo';

import { unwrapVariants } from '../ctf-helpers';
import {
  CtfFeaturedCardsQuery,
  CtfFeaturedCardsQuery_componentFeaturedCards,
} from './__generated__/CtfFeaturedCardsQuery';
import CtfFeaturedCards, {
  CtfFeaturedCardsPropsType,
} from './ctf-featured-cards';
import { query } from './ctf-featured-cards-query';

import { useDataForPreview } from '@src/lib/apollo-hooks';

interface CtfFeaturedCardsGqlPropsInterface {
  id: string;
  locale: string;
  preview: boolean;
}

const CtfFeaturedCardsGql = ({
  id,
  locale,
  preview,
}: CtfFeaturedCardsGqlPropsInterface) => {
  const queryResult = useQuery<CtfFeaturedCardsQuery>(query, {
    variables: {
      id,
      locale,
      preview,
    },
  });

  useDataForPreview(queryResult);

  if (
    queryResult.data === undefined ||
    queryResult.loading === true ||
    queryResult.data.componentFeaturedCards === null
  ) {
    return null;
  }

  return (
    <Personalize<CtfFeaturedCardsPropsType>
      component={CtfFeaturedCards}
      {...unwrapVariants<CtfFeaturedCardsQuery_componentFeaturedCards>(
        queryResult.data.componentFeaturedCards,
      )}
    />
  );
};

export default CtfFeaturedCardsGql;