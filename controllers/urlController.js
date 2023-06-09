const URLModel = require('../models/urlModel');
const validURL = require('valid-url');
const shortId = require('shortid');
const { SET_ASYNC, GET_ASYNC } = require('../utils/redisClient.js');
// const { checkValidURL } = require('../utils/axiosValidation.js');

const createURL = async (req, res) => {
  try {
    const { longUrl } = req.body;

    if (!longUrl) {
      return res.status(400).send({
        status: false,
        message: 'Missing LongUrl',
      });
    }

    if (!validURL.isWebUri(longUrl)) {
      return res.status(400).send({
        status: false,
        message: 'Invalid URL VALIDURL',
      });
    }

    // const isValidUrlAxios = await checkValidURL(longUrl)

    // if(isValidUrlAxios.isValid===false)return res.status(400).json({status : false, message : 'Invalid URL AXIOS'})



    // check if longUrl is already cached in redis server
    let cachedUrl = await GET_ASYNC(longUrl);


    if (cachedUrl) {
        // if present then send it to user
      const { shortUrl } = JSON.parse(cachedUrl);
      return res.status(200).send({
        status: true,
        
        data : {
          shortUrl
        },
      });
    }

    let url = await URLModel.findOne({
      longUrl: longUrl,
    })


    if (url) {
      await SET_ASYNC(
        longUrl,
        JSON.stringify({
          urlCode: url.urlCode,
          shortUrl: url.shortUrl,
        }),
        'EX',
        24 * 60 * 60
      );
      return res.status(200).send({
        status: true,
        
        shortUrl: url.shortUrl,
      });
    }

    const urlCode = shortId.generate();
    const shortUrl = `http://localhost:3000/${urlCode}`;

    const data = await URLModel.create({
      urlCode,
      longUrl,
      shortUrl,
    });

    await SET_ASYNC(
      longUrl,
      JSON.stringify({
        urlCode,
        shortUrl,
      }),
      'EX',
      24 * 60 * 60
    );

    res.status(201).send({
      status: true,
      data: {
        longUrl,
        shortUrl,
        urlCode,
      },
    });


  } catch (error) {
    res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};




const getUrl = async (req, res) => {
  try {
    const { urlCode } = req.params;

    let cachedUrl = await GET_ASYNC(urlCode);
    if (cachedUrl) {
      const { longUrl } = JSON.parse(cachedUrl);
      return res.status(302).redirect(longUrl);
    }

    const url = await URLModel.findOne({
      urlCode,
    });

    // check if 400 0r 404
    if (!url) {
      return res.status(404).json({
        status: false,
        message: 'URL not found or Incorrect URL',
      });
    }


    await SET_ASYNC(
      urlCode,
      JSON.stringify({ longUrl: url.longUrl }),
      'EX',
      24 * 60 * 60
    );

    return res.status(302).redirect(url.longUrl);
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

module.exports = {
  createURL,
  getUrl,
};
