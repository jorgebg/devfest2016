jQuery(document).ready(function($) {

    firebase.initializeApp({
        apiKey: "ILIKETRAINS",
        authDomain: "one-vote-5bdea.firebaseapp.com",
        databaseURL: "https://one-vote-5bdea.firebaseio.com",
        storageBucket: "one-vote-5bdea.appspot.com",
        messagingSenderId: "234269597237"
    });


    // Get a reference to the database service
    var votes = firebase.database().ref('votes');

    var vote = function(subject) {
        var imageBase64 = captureImage();
        makeVisionApiRequest(imageBase64, subject);
    }


  function canvasToDataURL(canvas) {
    return canvas.toDataURL("image/png", 1).replace(/^data:image\/(png|jpg);base64,/, "");
  }

    function captureImage() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0, 480, 360);
            return canvasToDataURL(canvas);
    }


      function buildVisionRequest(imageBase64) {
        return {
          requests: [
            {
              image: {
                content: imageBase64
              },
              features: [
              	{ type: "LABEL_DETECTION" },
                { type: "TEXT_DETECTION" },
                { type: "FACE_DETECTION" },
                { type: "LANDMARK_DETECTION" },
                { type: "LOGO_DETECTION" },
                { type: "SAFE_SEARCH_DETECTION" },
              ]
            }
          ]
        };
      }

    function makeVisionApiRequest(imageBase64, subject) {
        var requestData = buildVisionRequest(imageBase64);
        var url = "https://vision.googleapis.com/v1/images:annotate?key=[key]";


        // Put the real API key value in the URL.
        url = url.replace("[key]", cloudVisionApiKey);

        return $.ajax(url, {
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(requestData)
        }).then(function(data) {
            console.log('JSON response: ');
            // console.log(data.responses[0].faceAnnotations[0].landmarks);
            var n_data = normalize(data.responses[0].faceAnnotations[0].landmarks);
            console.log(n_data);
            var voted = false;
            for (var i = 0; i < votes.length && !voted; i++) {
                for (var j = 0; j < votes[i].landmarks.length && !voted; j++) {
                    var distance = math.distance(votes[i].landmarks[j], n_data[j]);
                    console.log(distance);
                    if (distance < 40) {
                        alert("You have already voted");
                        voted = true;
                    }
                }
            }
            if(!voted) {
                alert("Thanks for your vote!");
                votes.push({landmarks: n_data, subject: subject});
            }
        }, function(err) {
            console.log(err);
        });
    }



    var canvas = $('#demo-canvas')[0],
        context = canvas.getContext('2d'),
        video = $('#demo-video')[0];

    $('#vote-a').click(function() {
        vote('a');
        return false;
    });

    $('#vote-b').click(function() {
        vote('b');
        return false;
    });

    navigator.webkitGetUserMedia({
        video: true
    }, function(stream) {
        video.src = window.URL.createObjectURL(stream);
        video.play();
    }, function(error) {
        console.log('Error capturing video: ', error.code);
    });

    var cloudVisionApiKey = "ILIKETRAINS";


    var normalize = function(landmarks) {
        var n_landmarks = [];
        for (var i = 0; i < landmarks.length; i++) {
            n_landmarks.push([landmarks[i].position.x, landmarks[i].position.y]);
        }
        return n_landmarks;
    }


}); // end document.ready()
