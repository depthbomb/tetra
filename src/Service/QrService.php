<?php namespace App\Service;

use Endroid\QrCode\QrCode;
use Endroid\QrCode\Color\Color;
use Endroid\QrCode\Writer\SvgWriter;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\RoundBlockSizeMode\RoundBlockSizeModeMargin;
use Endroid\QrCode\ErrorCorrectionLevel\ErrorCorrectionLevelLow;

class QrService
{
    public function generateQrCode(string $contents, int $size = 256): string
    {
        $svg_writer = new SvgWriter();
        $qr_code    = QrCode::create($contents)
            ->setEncoding(new Encoding('UTF-8'))
            ->setErrorCorrectionLevel(new ErrorCorrectionLevelLow())
            ->setSize($size)
            ->setMargin(8)
            ->setRoundBlockSizeMode(new RoundBlockSizeModeMargin())
            ->setForegroundColor(new Color(5, 190, 249))
            ->setBackgroundColor(new Color(255, 255, 255));

        $result = $svg_writer->write($qr_code);

        return $result->getString();
    }
}
