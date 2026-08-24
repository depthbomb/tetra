package qr

import (
	"image/color"

	goqr "github.com/piglig/go-qr"
)

type Service struct{}

func New() *Service {
	return new(Service)
}

func (s *Service) Create(input string) ([]byte, error) {
	qrc, err := goqr.EncodeText(input, goqr.Low)
	if err != nil {
		return nil, err
	}

	config := goqr.NewQrCodeImgConfig(2, 3, goqr.WithDark(color.RGBA{R: 0, G: 149, B: 207, A: 255}), goqr.WithOptimalSVG())
	svgBytes, err := qrc.ToSVGBytes(config)
	if err != nil {
		return nil, err
	}

	return svgBytes, nil
}
