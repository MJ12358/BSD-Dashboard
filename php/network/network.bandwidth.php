<?php
require_once 'network.php';

class NetworkBandwidth extends Network {

	private $network_bandwidth_total;

	public function __construct() {
		echo json_encode(array(
			'data' => $this->getBandwidth(),
			'total' => $this->network_bandwidth_total
		));
	}

  // looping through the interfaces adds one second to rtt for each interface
  public function getBandwidth(...$interface) {
    $result = array();
    // $value = 'all';
    // foreach(self::$if_count as $key => $value) {
      $cmd = 'netstat -w 1 -q 1 -b4nW | tail -1';
      // $cmd = 'netstat -I ' . $value . ' -w 1 -q 1 -b4nW | tail -1';
      $stats = preg_split('/\s+/', Shell::exec($cmd));
      $bytes_in = $stats[3];
			$bytes_out = $stats[6];
			$this->network_bandwidth_total = $bytes_in + $bytes_out;
      return array(
        'bytes_in' => $bytes_in,
				'bytes_out' => $bytes_out,
        // 'formatted_in' => Convert::from_bytes($bytes_in),
        // 'formatted_out' => Convert::from_bytes($bytes_out)
      );
    // }
    // return $result;
  }

}

$network_bandwidth = new NetworkBandwidth();

?>