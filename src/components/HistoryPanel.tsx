import { motion } from 'framer-motion';
import type {
  OutcomeRecord,
  QuestionDetails as IQuestionDetails,
} from '@agoric/governance/src/types';
import { usePublishedDatum, usePublishedHistory } from 'lib/wallet.js';
import { QuestionDetails } from './questions.js';
import { Triangle } from 'react-loader-spinner';
import { useEffect, useRef } from 'react';

interface Props {}

const tabContentVariant = {
  active: {
    display: 'block',
    transition: {
      staggerChildren: 0.2,
    },
  },
  inactive: {
    display: 'none',
  },
};

const cardVariant = {
  active: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
  inactive: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.5,
    },
  },
};

const paginationSize = 5;

export default function HistoryPanel(_props: Props) {
  const { status: instanceStatus, data: instance } = usePublishedDatum(
    'agoricNames.instance',
  );
  const {
    status: questionsStatus,
    data: questions,
    fetchNextPage: fetchQuestions,
  } = usePublishedHistory(
    'committees.Economic_Committee.latestQuestion',
    paginationSize,
  );
  const {
    status: outcomesStatus,
    data: outcomes,
    fetchNextPage: fetchOutcomes,
  } = usePublishedHistory(
    'committees.Economic_Committee.latestOutcome',
    paginationSize,
  );

  const loaderRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const target = entries[0];
      if (target.isIntersecting) {
        fetchQuestions();
        fetchOutcomes();
      }
    });

    const { current } = loaderRef;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [fetchOutcomes, fetchQuestions]);

  const dataLoaded = [instanceStatus, questionsStatus, outcomesStatus].every(
    s => s === 'received',
  );

  const outcomeByHandle = new Map(
    outcomes.map((o: OutcomeRecord) => [o.question, o]),
  );
  const questionsWithAnswers: [q: IQuestionDetails, a: OutcomeRecord][] =
    questions.map((q: IQuestionDetails) => [
      q,
      outcomeByHandle.get(q.questionHandle),
    ]);

  const receivedItems =
    dataLoaded && !questionsWithAnswers.length ? (
      <div className="italic text-center mt-16">No questions yet.</div>
    ) : (
      instanceStatus === 'received' &&
      questionsWithAnswers.map(([qData, aData], index) => (
        <motion.div
          key={index}
          variants={cardVariant}
          className="rounded-lg border-gray border shadow-md mb-4"
        >
          <QuestionDetails
            details={qData}
            outcome={aData}
            instance={instance}
          />
        </motion.div>
      ))
    );

  const loader = (
    <div ref={loaderRef}>
      {dataLoaded ? (
        <></>
      ) : (
        <div className="text-gray-500 flex-col flex items-center mt-16 space-y-8">
          <div className="w-fit">
            <Triangle color="var(--color-primary)" />
          </div>
          <div>Stand by for question details...</div>
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      animate="active"
      initial="inactive"
      variants={tabContentVariant}
      className="pt-2"
    >
      {receivedItems}
      {loader}
    </motion.div>
  );
}
