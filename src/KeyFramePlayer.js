
KeyFramePlayer = function (viewer) {

	this.viewer = viewer;
	this.keyFrames = [];
	this.time = 0.0;
	this.playing = false;

	var scope = this;

	this.recordKeyFrame = function () {
		var position = new THREE.Vector3();
		position.copy(scope.viewer.scene.view.position);
		var lookAt = this.getCurrentLookAt();
		var keyFrame = {
			position: position,
			lookAt: lookAt,
		}
		scope.keyFrames.push(keyFrame);
	};

	this.getCurrentLookAt = function () {
		let view = scope.viewer.scene.view;
		let dir = view.direction.clone().multiplyScalar(10);
		return view.position.clone().add(dir);
	}

	this.play = function () {
		scope.playing = true;
	}

	this.pause = function () {
		scope.playing = false;
	}

	this.togglePlay = function () {
		scope.playing = !scope.playing;
	}

	this.stop = function () {
		scope.playing = false;
		scope.time = 0;
	}

	this.interpolateVector = function (name, alpha) {
		var num_points = scope.keyFrames.length;
		var points = [];
		for (var i = 0; i < num_points; ++i) {
			points.push(scope.keyFrames[i][name]);
		}
		for (var i = num_points; i < 4; ++i) {
			points.push(scope.keyFrames[num_points - 1][name]);
		}
		var curve = new THREE.CatmullRomCurve3(points);
		return curve.getPointAt(Math.min(1.0, alpha));
	}

	this.update = function (delta) {
		var num_points = scope.keyFrames.length;

		if (scope.playing && num_points > 0) {
			scope.time += delta;
			var speed = 1.0;
			var t = scope.time * speed;

			var position = scope.interpolateVector('position', t / (num_points - 1));
			var lookAt = scope.interpolateVector('lookAt', t / (num_points - 1));

			scope.viewer.scene.view.position.copy(position);
			scope.viewer.scene.view.lookAt(lookAt);

			if (t > num_points - 1) {
				scope.stop();
				return;
			}
		}
	};

	function onKeyDown(event) {
		switch (event.keyCode) {
			case 49:
				if (event.altKey) {
					scope.recordKeyFrame();
				} else {
					scope.togglePlay();
				}
				break;
		}
	}

	window.addEventListener('keydown', onKeyDown, false);

};
