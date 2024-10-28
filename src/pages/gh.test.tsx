// Copyright 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { getApiClientFromContext } from "@/services/devGuardApi";
import { encodeObjectBase64 } from "@/services/encodeService";
import { getServerSideProps } from "./gh";

jest.mock("@/services/devGuardApi");

jest.useFakeTimers();
describe("getServerSideProps", () => {
  const mockStateObj = { orgSlug: "orgSlug", redirectTo: "/redirect" };
  const mockCtx: any = {
    query: {
      state: encodeObjectBase64(mockStateObj),
      installation_id: "installationId",
    },
  };

  const mockApiClient = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getApiClientFromContext as jest.Mock).mockReturnValue(mockApiClient);
  });

  it("should redirect to the correct URL if installation is successful", async () => {
    mockApiClient.mockResolvedValueOnce({ ok: true });

    const result = getServerSideProps(mockCtx);
    await jest.runAllTimersAsync();

    expect(await result).toEqual({
      redirect: {
        destination: mockStateObj.redirectTo,
        permanent: false,
      },
    });
  });

  it("should retry 3 times if installation fails", async () => {
    mockApiClient.mockResolvedValueOnce({ ok: false });
    mockApiClient.mockResolvedValueOnce({ ok: false });
    mockApiClient.mockResolvedValueOnce({ ok: true });

    const result = getServerSideProps(mockCtx);
    jest.runAllTimers();
    await jest.runAllTimersAsync();

    expect(mockApiClient).toHaveBeenCalledTimes(3);
    expect(await result).toEqual({
      redirect: {
        destination: mockStateObj.redirectTo,
        permanent: false,
      },
    });
  });

  it("should return error props if installation fails after 3 retries", async () => {
    mockApiClient.mockResolvedValue({ ok: false });

    const result = getServerSideProps(mockCtx);
    await jest.runAllTimersAsync();

    expect(mockApiClient).toHaveBeenCalledTimes(3);
    expect(await result).toEqual({
      props: {
        error: "Installation failed",
      },
    });
  });
});
