<?php
require_once 'system.php';

class Usage extends System {

	public function __construct() {

	}

  public function getProcessCount() {
    $proc_count = 0;
    $dh = opendir('/proc');
    while ($dir = readdir($dh)) {
      if (is_dir('/proc/' . $dir)) {
        if (preg_match('/^[0-9]+$/', $dir)) {
          $proc_count++;
        }
      }
    }
    return $proc_count;
  }

  public function getTopProcesses() {
    // would be nice to output 'command' but it may have spaces in it ('args' seems to do the same thing)
    $cmd = 'ps -rAo user,pid,time,nlwp,pcpu,pmem,comm,dsiz,etimes | grep -v root | head -10 | tail -n +2';
    $result = Shell::exec($cmd);
    $result = explode(PHP_EOL, $result);
    $results = array();
    foreach($result as $key => $value) {
      $value = preg_split('/\s+/', $value);
      $results[] = array(
        'user' => $value[0],
        'pid' => $value[1],
        'time' => $value[2],
        'nlwp' => $value[3],
        'pcpu' => $value[4],
        'pmem' => $value[5],
        'comm' => $value[6]
        // 'dsiz' => Convert::from_bytes($value[7])
        // 'etimes' => Convert::from_seconds($value[7])
      );
    }
    return $results;
  }

}

$system_usage = new Usage();

?>