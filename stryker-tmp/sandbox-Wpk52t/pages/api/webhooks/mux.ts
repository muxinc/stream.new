// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import { NextApiRequest, NextApiResponse } from 'next';
import Mux from '@mux/mux-node';
import { buffer } from 'micro';
import { sendSlackAssetReady, sendSlackAutoDeleteMessage } from '../../../lib/slack-notifier';
import { getScores as moderationGoogle } from '../../../lib/moderation-google';
import { getScores as moderationHive } from '../../../lib/moderation-hive';
import { autoDelete } from '../../../lib/moderation-action';
const webhookSignatureSecret = process.env.MUX_WEBHOOK_SIGNATURE_SECRET;
const mux = new Mux();
const verifyWebhookSignature = (rawBody: string | Buffer, req: NextApiRequest) => {
  if (stryMutAct_9fa48("810")) {
    {}
  } else {
    stryCov_9fa48("810");
    if (stryMutAct_9fa48("812") ? false : stryMutAct_9fa48("811") ? true : (stryCov_9fa48("811", "812"), webhookSignatureSecret)) {
      if (stryMutAct_9fa48("813")) {
        {}
      } else {
        stryCov_9fa48("813");
        // this will raise an error if signature is not valid
        mux.webhooks.verifySignature(Buffer.isBuffer(rawBody) ? rawBody.toString(stryMutAct_9fa48("814") ? "" : (stryCov_9fa48("814"), 'utf8')) : rawBody, req.headers, webhookSignatureSecret);
      }
    } else {
      if (stryMutAct_9fa48("815")) {
        {}
      } else {
        stryCov_9fa48("815");
        console.log(stryMutAct_9fa48("816") ? "" : (stryCov_9fa48("816"), 'Skipping webhook sig verification because no secret is configured')); // eslint-disable-line no-console
      }
    }
    return stryMutAct_9fa48("817") ? false : (stryCov_9fa48("817"), true);
  }
};

//
// By default, NextJS will look at the content type and intelligently parse the body
// This is great. Except that for webhooks we need access to the raw body if we want
// to do signature verification
//
// By setting bodyParser: false here we have to extract the rawBody as a string
// and use JSON.parse on it manually.
//
// If we weren't doing webhook signature verification then the code can get a bit simpler
//
export const config = stryMutAct_9fa48("818") ? {} : (stryCov_9fa48("818"), {
  api: stryMutAct_9fa48("819") ? {} : (stryCov_9fa48("819"), {
    bodyParser: stryMutAct_9fa48("820") ? true : (stryCov_9fa48("820"), false)
  })
});
export default async function muxWebhookHandler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (stryMutAct_9fa48("821")) {
    {}
  } else {
    stryCov_9fa48("821");
    const {
      method
    } = req;
    switch (method) {
      case stryMutAct_9fa48("823") ? "" : (stryCov_9fa48("823"), 'POST'):
        if (stryMutAct_9fa48("822")) {} else {
          stryCov_9fa48("822");
          {
            if (stryMutAct_9fa48("824")) {
              {}
            } else {
              stryCov_9fa48("824");
              const rawBody = (await buffer(req)).toString();
              try {
                if (stryMutAct_9fa48("825")) {
                  {}
                } else {
                  stryCov_9fa48("825");
                  verifyWebhookSignature(rawBody, req);
                }
              } catch (e) {
                if (stryMutAct_9fa48("826")) {
                  {}
                } else {
                  stryCov_9fa48("826");
                  console.error(stryMutAct_9fa48("827") ? "" : (stryCov_9fa48("827"), 'Error verifyWebhookSignature - is the correct signature secret set?'), e);
                  res.status(400).json(stryMutAct_9fa48("828") ? {} : (stryCov_9fa48("828"), {
                    message: (e as Error).message
                  }));
                  return;
                }
              }
              const jsonBody = JSON.parse(rawBody);
              const {
                data,
                type
              } = jsonBody;
              if (stryMutAct_9fa48("831") ? type === 'video.asset.ready' : stryMutAct_9fa48("830") ? false : stryMutAct_9fa48("829") ? true : (stryCov_9fa48("829", "830", "831"), type !== (stryMutAct_9fa48("832") ? "" : (stryCov_9fa48("832"), 'video.asset.ready')))) {
                if (stryMutAct_9fa48("833")) {
                  {}
                } else {
                  stryCov_9fa48("833");
                  res.json(stryMutAct_9fa48("834") ? {} : (stryCov_9fa48("834"), {
                    message: stryMutAct_9fa48("835") ? "" : (stryCov_9fa48("835"), 'thanks Mux')
                  }));
                  return;
                }
              }
              try {
                if (stryMutAct_9fa48("836")) {
                  {}
                } else {
                  stryCov_9fa48("836");
                  const assetId = data.id;
                  const playbackId = stryMutAct_9fa48("839") ? data.playback_ids && data.playback_ids[0] || data.playback_ids[0].id : stryMutAct_9fa48("838") ? false : stryMutAct_9fa48("837") ? true : (stryCov_9fa48("837", "838", "839"), (stryMutAct_9fa48("841") ? data.playback_ids || data.playback_ids[0] : stryMutAct_9fa48("840") ? true : (stryCov_9fa48("840", "841"), data.playback_ids && data.playback_ids[0])) && data.playback_ids[0].id);
                  const duration = data.duration;
                  const googleScores = await moderationGoogle(stryMutAct_9fa48("842") ? {} : (stryCov_9fa48("842"), {
                    playbackId,
                    duration
                  }));
                  const hiveResult = await moderationHive(stryMutAct_9fa48("843") ? {} : (stryCov_9fa48("843"), {
                    playbackId,
                    duration
                  }));
                  const hiveScores = stryMutAct_9fa48("844") ? hiveResult.scores : (stryCov_9fa48("844"), hiveResult?.scores);
                  const hiveTaskIds = stryMutAct_9fa48("845") ? hiveResult.taskIds : (stryCov_9fa48("845"), hiveResult?.taskIds);
                  const didAutoDelete = hiveScores ? await autoDelete(stryMutAct_9fa48("846") ? {} : (stryCov_9fa48("846"), {
                    assetId,
                    playbackId,
                    hiveScores
                  })) : stryMutAct_9fa48("847") ? true : (stryCov_9fa48("847"), false);
                  if (stryMutAct_9fa48("849") ? false : stryMutAct_9fa48("848") ? true : (stryCov_9fa48("848", "849"), didAutoDelete)) {
                    if (stryMutAct_9fa48("850")) {
                      {}
                    } else {
                      stryCov_9fa48("850");
                      await sendSlackAutoDeleteMessage(stryMutAct_9fa48("851") ? {} : (stryCov_9fa48("851"), {
                        assetId,
                        duration,
                        hiveScores,
                        hiveTaskIds
                      }));
                      res.json(stryMutAct_9fa48("852") ? {} : (stryCov_9fa48("852"), {
                        message: stryMutAct_9fa48("853") ? "" : (stryCov_9fa48("853"), 'thanks Mux, I autodeleted this asset because it was bad')
                      }));
                    }
                  } else {
                    if (stryMutAct_9fa48("854")) {
                      {}
                    } else {
                      stryCov_9fa48("854");
                      await sendSlackAssetReady(stryMutAct_9fa48("855") ? {} : (stryCov_9fa48("855"), {
                        assetId,
                        playbackId,
                        duration,
                        googleScores,
                        hiveScores,
                        hiveTaskIds
                      }));
                      res.json(stryMutAct_9fa48("856") ? {} : (stryCov_9fa48("856"), {
                        message: stryMutAct_9fa48("857") ? "" : (stryCov_9fa48("857"), 'thanks Mux, I notified myself about this')
                      }));
                    }
                  }
                }
              } catch (e) {
                if (stryMutAct_9fa48("858")) {
                  {}
                } else {
                  stryCov_9fa48("858");
                  res.statusCode = 500;
                  console.error(stryMutAct_9fa48("859") ? "" : (stryCov_9fa48("859"), 'Request error'), e); // eslint-disable-line no-console
                  res.json(stryMutAct_9fa48("860") ? {} : (stryCov_9fa48("860"), {
                    error: stryMutAct_9fa48("861") ? "" : (stryCov_9fa48("861"), 'Error handling webhook')
                  }));
                }
              }
              break;
            }
          }
        }
      default:
        if (stryMutAct_9fa48("862")) {} else {
          stryCov_9fa48("862");
          res.setHeader(stryMutAct_9fa48("863") ? "" : (stryCov_9fa48("863"), 'Allow'), stryMutAct_9fa48("864") ? [] : (stryCov_9fa48("864"), [stryMutAct_9fa48("865") ? "" : (stryCov_9fa48("865"), 'POST')]));
          res.status(405).end(stryMutAct_9fa48("866") ? `` : (stryCov_9fa48("866"), `Method ${method} Not Allowed`));
        }
    }
  }
}