import useSWR from "swr";

// import axios from "axios";

const fetcher = (data) => {
  const query = new URLSearchParams(data.params).toString();
  return fetch(`${data.url}?${query}`).then(res => res.json());
};

const options = {
    dedupingInterval: ((1000 * 60) * 30),
    // fallbackData: []
}

const useGameScoreboard = (params) => {

    const { data, error, isLoading, isValidating, mutate } = useSWR(
        params?.game ?
            {
                url: "/api/community/games/scoreboard",
                params: { game: params.game }
            }
            :
            null,
        fetcher,
        options
    );

    return {
        data,
        error,
        isLoading,
        isValidating,
        mutate,
    };
};

export default useGameScoreboard;