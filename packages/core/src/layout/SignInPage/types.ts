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

import { ComponentType } from 'react';
import {
  SignInPageProps,
  SignInResult,
  ApiHolder,
  ApiRef,
  OAuthApi,
  ProfileInfoApi,
  BackstageIdentityApi,
  SessionStateApi,
} from '@backstage/core-api';

export type SignInConfig = {
  id: string;
  title: string;
  message: string;
  apiRef: ApiRef<
    OAuthApi & ProfileInfoApi & BackstageIdentityApi & SessionStateApi
  >;
};

export type IdentityProviders = ('guest' | 'custom' | SignInConfig)[];

export type ProviderComponent = ComponentType<
  SignInPageProps & { config: SignInConfig }
>;

export type ProviderLoader = (
  apis: ApiHolder,
  apiRef: ApiRef<
    OAuthApi & ProfileInfoApi & BackstageIdentityApi & SessionStateApi
  >,
) => Promise<SignInResult | undefined>;

export type SignInProvider = {
  Component: ProviderComponent;
  loader: ProviderLoader;
};
