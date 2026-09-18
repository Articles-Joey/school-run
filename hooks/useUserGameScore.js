import useSWR from "swr";

// import { useSelector, useDispatch } from 'react-redux';

// import axios from "axios";
import { minutesToMilliseconds } from "date-fns";

import useUserToken from "@articles-media/articles-dev-box/useUserToken";
import useUserDetails from "@articles-media/articles-dev-box/useUserDetails";

// const fetcher = (data) => axios.get(data.url, {
//     params: {
//         game: data.game
//     }
// }).then((res) => res.data);

const fetcher = (data) => {
    const query = new URLSearchParams(data.params).toString();
    return fetch(`${data.url}?${query}`, {
        headers: {
            "x-articles-api-key": data.userToken,
        },
    }).then((res) => res.json());
};

const useUserGameScore = (params) => {
    // const userReduxState = useSelector((state) => state.auth.user_details)
    // const userReduxState = false
    const {
        data: userToken,
        error: userTokenError,
        isLoading: userTokenLoading,
        mutate: userTokenMutate,
    } = useUserToken(process.env.NEXT_PUBLIC_GAME_PORT);

    const {
        data: userDetails,
        error: userDetailsError,
        isLoading: userDetailsLoading,
        mutate: userDetailsMutate,
    } = useUserDetails({
        token: userToken,
    });

    const baseLink =
        process.env.NODE_ENV === "development"
            ? "http://localhost:3001"
            : "https://articles.media";

    const { data, error, isLoading, mutate } = useSWR(
        userDetails?.user_id && params.game
            ? {
                  url: `${baseLink}/api/user/community/games/scoreboard/get`,
                  params: { game: params.game },
                  userToken,
              }
            : null,
        fetcher,
        {
            dedupingInterval: minutesToMilliseconds(10),
            focusThrottleInterval: minutesToMilliseconds(10),
        },
    );

    return {
        data,
        error,
        isLoading,
        mutate,
    };
};

export default useUserGameScore;
