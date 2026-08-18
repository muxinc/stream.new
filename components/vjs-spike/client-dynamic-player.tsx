'use client';

/*
 * Spike variant: 'use client' + next/dynamic — mirrors how stream.new's
 * PlayerLoader loads players today (the control for the current approach). (CJP)
 */
import dynamic from 'next/dynamic';

import type { SpikePlayerProps } from './types';

const ClientStaticPlayer = dynamic(() => import('./client-static-player'));

const ClientDynamicPlayer = (props: SpikePlayerProps) => <ClientStaticPlayer {...props} />;

export default ClientDynamicPlayer;
