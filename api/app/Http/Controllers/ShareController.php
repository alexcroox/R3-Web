<?php

namespace App\Http\Controllers;

use App\Share;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class ShareController extends Controller
{

    /**
     * @SWG\Get(
     *     tags={"Shares"},
     *     path="/shares",
     *     summary="Finds all mission shares",
     *     description="Returns all shares created during mission playback",
     *     @SWG\Response(
     *         response=200,
     *         description="A list of all shares"
     *     )
     * )
     */
    public function fetchAll()
    {

        return Share::get();
    }

    /**
     * @SWG\Get(
     *     tags={"Shares"},
     *     path="/shares/{shareId}",
     *     summary="Find share by Id",
     *     description="Find share by Id and increment hits by 1",
     *     @SWG\Parameter(
     *         description="Id of share to return",
     *         in="path",
     *         name="shareId",
     *         required=true,
     *         default=1,
     *         type="integer",
     *         format="int64"
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="A single share"
     *     ),
     *     @SWG\Response(
     *         response="404",
     *         description="Share not found"
     *     )
     * )
     */
    public function fetchOne($id)
    {
        $share = Share::find($id);

        if($share)
        {
            Share::whereId($id)->increment('hits');
            return response()->json($share);
        }
        else
        {
            return response()->json(['error' => 'Not Found'], 404);
        }
    }

    /**
     * @SWG\Post(
     *     tags={"Shares"},
     *     path="/shares",
     *     summary="Add a new share",
     *     description="Add a new share",
     *     @SWG\Parameter(
     *         description="Mission Id",
     *         name="mission",
     *         in="formData",
     *         required=true,
     *         default=1,
     *         type="integer"
     *     ),
     *     @SWG\Parameter(
     *         description="Url to share",
     *         name="url",
     *         in="formData",
     *         required=true,
     *         default="https://example.com/1/test",
     *         type="string",
     *         minLength=10
     *     ),
     *     @SWG\Parameter(
     *         description="Share description",
     *         name="description",
     *         in="formData",
     *         required=false,
     *         type="string"
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="A single share"
     *     ),
     *     @SWG\Response(
     *         response="404",
     *         description="Share not found"
     *     )
     * )
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'mission' => 'required|integer',
            'url' => 'required|min:10'
        ]);

        $data = $request->all();
        $data['ip_address'] = $request->ip();

        return Share::create($data);
    }
}
