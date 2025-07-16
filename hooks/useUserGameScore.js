import useSWR from "swr";

// import { useSelector, useDispatch } from 'react-redux';

import axios from "axios";
import { minutesToMilliseconds } from "date-fns";

const fetcher = (data) => axios.get(data.url, {
    params: {
        game: data.game
    }
}).then((res) => res.data);

const useUserGameScore = (params) => {

    // const userReduxState = useSelector((state) => state.auth.user_details)
    const userReduxState = false

    const { data, error, isLoading, mutate } = useSWR(
        ((userReduxState?._id && params.game ) ?
            {
                url: "/api/user/community/games/scoreboard/get",
                game: `${params.game}`
            }
            :
            null
        ),
        fetcher,
        {
            dedupingInterval: minutesToMilliseconds(10),
            focusThrottleInterval: minutesToMilliseconds(10),
        }
    );

    return {
        data,
        error,
        isLoading,
        mutate,
    };
};

export default useUserGameScore;