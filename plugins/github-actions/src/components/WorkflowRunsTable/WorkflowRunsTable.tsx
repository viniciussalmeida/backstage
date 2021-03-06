/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { FC } from 'react';
import { Link, Typography, Box, IconButton, Tooltip } from '@material-ui/core';
import RetryIcon from '@material-ui/icons/Replay';
import GitHubIcon from '@material-ui/icons/GitHub';
import { Link as RouterLink, generatePath } from 'react-router-dom';
import { Table, TableColumn } from '@backstage/core';
import { useWorkflowRuns } from '../useWorkflowRuns';
import { WorkflowRunStatus } from '../WorkflowRunStatus';
import SyncIcon from '@material-ui/icons/Sync';
import { buildRouteRef } from '../../plugin';
import { useEntityCompoundName } from '@backstage/plugin-catalog';
import { useProjectName } from '../useProjectName';

export type WorkflowRun = {
  id: string;
  message: string;
  url?: string;
  githubUrl?: string;
  source: {
    branchName: string;
    commit: {
      hash: string;
      url: string;
    };
  };
  status: string;
  onReRunClick: () => void;
};

const generatedColumns: TableColumn[] = [
  {
    title: 'ID',
    field: 'id',
    type: 'numeric',
    width: '150px',
  },
  {
    title: 'Message',
    field: 'message',
    highlight: true,
    render: (row: Partial<WorkflowRun>) => (
      <Link
        component={RouterLink}
        to={generatePath(buildRouteRef.path, { id: row.id! })}
      >
        {row.message}
      </Link>
    ),
  },
  {
    title: 'Source',
    render: (row: Partial<WorkflowRun>) => (
      <Typography variant="body2" noWrap>
        <p>{row.source?.branchName}</p>
        <p>{row.source?.commit.hash}</p>
      </Typography>
    ),
  },
  {
    title: 'Status',
    width: '150px',

    render: (row: Partial<WorkflowRun>) => (
      <Box display="flex" alignItems="center">
        <WorkflowRunStatus status={row.status} />
      </Box>
    ),
  },
  {
    title: 'Actions',
    render: (row: Partial<WorkflowRun>) => (
      <Tooltip title="Rerun workflow">
        <IconButton onClick={row.onReRunClick}>
          <RetryIcon />
        </IconButton>
      </Tooltip>
    ),
    width: '10%',
  },
];

type Props = {
  loading: boolean;
  retry: () => void;
  runs?: WorkflowRun[];
  projectName: string;
  page: number;
  onChangePage: (page: number) => void;
  total: number;
  pageSize: number;
  onChangePageSize: (pageSize: number) => void;
};

export const WorkflowRunsTableView: FC<Props> = ({
  projectName,
  loading,
  pageSize,
  page,
  retry,
  runs,
  onChangePage,
  onChangePageSize,
  total,
}) => {
  return (
    <Table
      isLoading={loading}
      options={{ paging: true, pageSize, padding: 'dense' }}
      totalCount={total}
      page={page}
      actions={[
        {
          icon: () => <SyncIcon />,
          tooltip: 'Reload workflow runs',
          isFreeAction: true,
          onClick: () => retry(),
        },
      ]}
      data={runs ?? []}
      onChangePage={onChangePage}
      onChangeRowsPerPage={onChangePageSize}
      title={
        <Box display="flex" alignItems="center">
          <GitHubIcon />
          <Box mr={1} />
          <Typography variant="h6">{projectName}</Typography>
        </Box>
      }
      columns={generatedColumns}
    />
  );
};

export const WorkflowRunsTable = () => {
  let entityCompoundName = useEntityCompoundName();

  if (!entityCompoundName.name) {
    // TODO(shmidt-i): remove when is fully integrated
    // into the entity view
    entityCompoundName = {
      kind: 'Component',
      name: 'backstage',
      namespace: 'default',
    };
  }

  const { value: projectName, loading } = useProjectName(entityCompoundName);
  const [owner, repo] = (projectName ?? '/').split('/');
  const [tableProps, { retry, setPage, setPageSize }] = useWorkflowRuns({
    owner,
    repo,
  });
  return (
    <WorkflowRunsTableView
      {...tableProps}
      loading={loading || tableProps.loading}
      retry={retry}
      onChangePageSize={setPageSize}
      onChangePage={setPage}
    />
  );
};
