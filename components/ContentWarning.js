import dynamic from 'next/dynamic';
import Link from 'next/link';

// import ROUTES from 'components/constants/routes'

import ArticlesButton from '@/components/UI/Button';

// import { useLocalStorageNew } from 'util/useLocalStorageNew';
import { useGameStore } from '@/hooks/useGameStore';

const ArticlesModal = dynamic(() => import('@/components/UI/ArticlesModal'), {
    ssr: false,
});

export default function SchoolRunContentWarning() {

    // const [contentWarningAccept, setContentWarningAccept] = useLocalStorageNew("game:school-run:contentWarningAccept", false)

    const {
        contentWarningAccept,
        setContentWarningAccept,
    } = useGameStore(state => ({
        contentWarningAccept: state.contentWarningAccept,
        setContentWarningAccept: state.setContentWarningAccept,
    }));

    return (
        <>
            {!contentWarningAccept &&
                <ArticlesModal
                    show={contentWarningAccept}
                    setShow={setContentWarningAccept}
                    title="Content Warning"
                    disableClose
                    action={(setShowModal) => {
                        console.log("")
                        setContentWarningAccept(true)
                        // setShowModal(false)
                    }}
                    actionText="I Accept"
                >
                    <div className='mb-3'>
                        This game contains graphic depictions of violence, including school shooting scenarios, which some players may find deeply disturbing. It features themes of gun violence, psychological trauma, and mature language. Viewer and player discretion is strongly advised.
                    </div>
                    <div className="mb-3">
                        This game is a satirical commentary on the ongoing failure to address the epidemic of gun violence, particularly in schools. It seeks to highlight the inaction and complacency surrounding this crisis, forcing players to confront the stark reality of these tragedies. Our goal is to spark meaningful conversations and encourage critical reflection on policies, societal attitudes, and the urgent need for reform. While the content is intentionally provocative, it serves as a call to action: to demand change, accountability, and the protection of lives over indifference.
                    </div>
                    <Link href={`https://articles.media/politics/proposals/gun-owner-education`}>
                        <ArticlesButton
                            className="mb-1 w-100"
                        >
                            Modernize School Defense Proposal
                        </ArticlesButton>
                    </Link>
                    <Link href={`https://articles.media/politics/proposals/gun-owner-education`}>
                        <ArticlesButton
                            className="mb-1 w-100"
                        >
                            Gun Owner Education Proposal
                        </ArticlesButton>
                    </Link>
                    <Link href={'https://articles.media/politics/proposals'}>
                        <ArticlesButton
                            className="mb-3 w-100"
                        >
                            View All Proposals
                        </ArticlesButton>
                    </Link>
                    <div>
                        {`Note: This content is intended for mature audiences only (17+). If you or someone you know is affected by similar experiences, consider seeking support from trusted individuals, mental health professionals, or crisis resources in your area. If you understand the purpose behind this game, and are desensitized enough to play without harm from these topics then you may continue by clicking "I accept"`}
                    </div>
                </ArticlesModal>
            }
        </>
    )

}