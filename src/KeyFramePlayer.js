
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

	this.interpolateVector = function (name, time) {
		var num_points = scope.keyFrames.length;
		var points = new Float32Array(3 * num_points);
		var times = new Float32Array(num_points);
		var result = new Float32Array(3);

		for (var i = 0; i < num_points; ++i) {
			points[3 * i + 0] = scope.keyFrames[i][name].x;
			points[3 * i + 1] = scope.keyFrames[i][name].y;
			points[3 * i + 2] = scope.keyFrames[i][name].z;
			times[i] = i;
		}

		var interpolant = new THREE.CubicInterpolant(times, points, 3, result);
		interpolant.evaluate(time);

		return new THREE.Vector3(result[0], result[1], result[2]);
	}

	this.update = function (delta) {
		var num_points = scope.keyFrames.length;

		if (scope.playing && num_points > 0) {
			scope.time += delta;
			var speed = 1.0;
			var t = scope.time * speed;

			var position = scope.interpolateVector('position', t);
			var lookAt = scope.interpolateVector('lookAt', t);

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
