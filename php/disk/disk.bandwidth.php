<?php
require_once 'disk.php';

// iostat -o // old-style iostat (miliseconds per seek)
// iostat -I // total stats for a time period (since boot??)
// diskinfo -tv /dev/ada0 is really cool but takes a long time (benchmark)

class Bandwidth extends Disk {

	private $disk_bandwidth_total;

	public function __construct() {
		echo json_encode(array(
			'data' => $this->getBandwidth(),
			'total' => $this->disk_bandwidth_total
		));
	}

  public function getBandwidth() {
    
    // possibly -I 1 (to get stats within time period)
    // $cmd = 'iostat -x -n 7';
		$cmd = 'zpool iostat tank 1 2 | tail -1';
		// this returns more than one space between properties
		$result = preg_replace('/\h+/', ' ', Shell::exec($cmd));
		// now turn that into an array
		$result = explode(' ', $result);
		$bytes_in = Convert::to_bytes($result[5]);
		$bytes_out = Convert::to_bytes($result[6]);
		$this->disk_bandwidth_total = $bytes_in + $bytes_out;
    return array(
			'bytes_in' => $bytes_in,
			'bytes_out' => $bytes_out,
			// 'formatted_out' => $result[5],
			// 'formatted_in' => $result[6]
    );
	}

	public function getIo() {
		// you could use top (and press -m to view iostats...)
		$cmd = 'zpool iostat tank 1 2 | tail -n -1';
		$result = preg_replace('/\h+/', ' ', Shell::exec($cmd));
    $result = explode(' ', $result);
    return array(
      'out' => $result[3],
      'in' => $result[4]
    );
	}

	public static function getIoPerDevice() {
		// -c should be 1 not two (also i don't think -o is doing anything here)
		$cmd = 'iostat -dox -t da -c 1 | tail -n +3';
		// $result = preg_split('/extended device statistics/', Shell::exec($cmd));
		$result = preg_replace('/\h+/', ' ', Shell::exec($cmd));
		$result = explode('/[\n\t\r]+/', $result);
		return $result;
	}

}

$disk_bandwidth = new Bandwidth();

?>